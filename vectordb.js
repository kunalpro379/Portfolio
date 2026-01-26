import fs from 'fs';
import path from 'path';

// Vector database functionality with graceful fallback
let QdrantClient;
let client;

// Try to import and initialize Qdrant client
(async () => {
  try {
    const qdrantModule = await import('@qdrant/js-client-rest');
    QdrantClient = qdrantModule.QdrantClient;
    
    // Initialize Qdrant client
    client = new QdrantClient({
        url: 'https://c0235c7b-a838-4d70-a6bd-560d3baaaea2.us-east4-0.gcp.cloud.qdrant.io:6333',
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.zcqrYkhc3IXkBdwrGDmPil85DjVljwWlN0Msft-Y6Kg',
    });
    
    console.log('✅ Qdrant client initialized successfully');
  } catch (error) {
    console.warn('⚠️ Qdrant client not available:', error.message);
    console.warn('⚠️ Vector database features will be disabled');
  }
})();

// Collection name for the knowledge base
const COLLECTION_NAME = 'Portfolio';

// Function to generate embeddings (using a simple approach for now)
// In production, you'd want to use OpenAI embeddings or similar
async function generateEmbedding(text) {
    // For now, we'll create a simple hash-based embedding
    // In production, replace this with actual embedding generation
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // 384-dimensional vector
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let j = 0; j < word.length; j++) {
            const charCode = word.charCodeAt(j);
            embedding[i % 384] += charCode / (j + 1);
        }
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
}

// Function to chunk text into smaller pieces
function chunkText(text, maxChunkSize = 1000, overlap = 200) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let currentSize = 0;
    
    for (const sentence of sentences) {
        const sentenceSize = sentence.trim().length;
        
        if (currentSize + sentenceSize > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            
            // Create overlap by keeping last part of current chunk
            const words = currentChunk.split(' ');
            const overlapWords = words.slice(-Math.floor(overlap / 10));
            currentChunk = overlapWords.join(' ') + ' ' + sentence.trim();
            currentSize = currentChunk.length;
        } else {
            currentChunk += ' ' + sentence.trim();
            currentSize = currentChunk.length;
        }
    }
    
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

// Function to extract metadata from text chunks
function extractMetadata(chunk, index, section = '') {
    const metadata = {
        chunk_index: index,
        section: section,
        word_count: chunk.split(/\s+/).length,
        char_count: chunk.length,
        timestamp: new Date().toISOString()
    };
    
    // Extract specific metadata based on content
    if (chunk.includes('Technology Stack:')) {
        metadata.type = 'project';
        metadata.has_tech_stack = true;
    } else if (chunk.includes('Duration:') || chunk.includes('Experience')) {
        metadata.type = 'experience';
    } else if (chunk.includes('Education') || chunk.includes('Bachelor') || chunk.includes('CGPA')) {
        metadata.type = 'education';
    } else if (chunk.includes('Skills') || chunk.includes('Technologies')) {
        metadata.type = 'skills';
    } else if (chunk.includes('Hackathon') || chunk.includes('Achievement')) {
        metadata.type = 'achievement';
    } else if (chunk.includes('Blog') || chunk.includes('January') || chunk.includes('2026')) {
        metadata.type = 'blog';
    } else {
        metadata.type = 'general';
    }
    
    // Extract technologies mentioned
    const techKeywords = [
        'JavaScript', 'Python', 'Java', 'C++', 'Node.js', 'React', 'AWS', 'Docker', 
        'Kubernetes', 'MongoDB', 'MySQL', 'Redis', 'Spring Boot', 'TypeScript',
        'Machine Learning', 'AI', 'Deep Learning', 'GAN', 'LSTM', 'ARIMA',
        'Azure', 'Linux', 'Kafka', 'GraphQL', 'Firebase', 'PyTorch'
    ];
    
    metadata.technologies = techKeywords.filter(tech => 
        chunk.toLowerCase().includes(tech.toLowerCase())
    );
    
    return metadata;
}

// Main function to upload document to Qdrant
async function uploadDocumentToQdrant(content = null, metadata = {}) {
    try {
        // Check if Qdrant client is available
        if (!client) {
            throw new Error('Qdrant client not available - vector database features are disabled');
        }
        
        console.log('🚀 Starting document upload to Qdrant...');
        
        // Use provided content or default to md.md file
        let documentContent = content;
        if (!documentContent) {
            console.log('📖 Reading document from AI/md.md...');
            // Read from the correct path relative to the project root
            const documentPath = path.join(process.cwd(), 'AI', 'md.md');
            try {
                documentContent = fs.readFileSync(documentPath, 'utf-8');
            } catch (error) {
                console.warn('⚠️ Could not read AI/md.md file:', error.message);
                documentContent = 'Default content for testing purposes.';
            }
        }
        
        console.log(`📄 Document loaded: ${documentContent.length} characters`);
        
        // Check if collection exists, create if not
        try {
            await client.getCollection(COLLECTION_NAME);
            console.log(`✅ Collection '${COLLECTION_NAME}' exists`);
        } catch (error) {
            console.log(`📦 Creating collection '${COLLECTION_NAME}'...`);
            await client.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: 384,
                    distance: 'Cosine'
                }
            });
            console.log(`✅ Collection '${COLLECTION_NAME}' created`);
        }
        
        // Split document into sections
        const sections = documentContent.split(/^##\s+/m).filter(section => section.trim().length > 0);
        console.log(`📑 Document split into ${sections.length} sections`);
        
        let totalPoints = 0;
        const batchSize = 10;
        let points = [];
        
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const section = sections[sectionIndex];
            const sectionTitle = section.split('\n')[0].trim();
            
            console.log(`🔄 Processing section: ${sectionTitle}`);
            
            // Chunk the section
            const chunks = chunkText(section, 800, 150);
            console.log(`   📝 Created ${chunks.length} chunks`);
            
            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                const chunk = chunks[chunkIndex];
                
                // Generate embedding
                const embedding = await generateEmbedding(chunk);
                
                // Extract metadata
                const chunkMetadata = extractMetadata(chunk, totalPoints, sectionTitle);
                
                // Merge with provided metadata
                const finalMetadata = {
                    ...chunkMetadata,
                    ...metadata,
                    section_title: sectionTitle,
                    section_index: sectionIndex,
                    chunk_index: chunkIndex,
                };
                
                // Create point
                const point = {
                    id: totalPoints,
                    vector: embedding,
                    payload: {
                        content: chunk,
                        ...finalMetadata
                    }
                };
                
                points.push(point);
                totalPoints++;
                
                // Upload in batches
                if (points.length >= batchSize) {
                    await client.upsert(COLLECTION_NAME, {
                        wait: true,
                        points: points
                    });
                    console.log(`   ⬆️  Uploaded batch of ${points.length} points`);
                    points = [];
                }
            }
        }
        
        // Upload remaining points
        if (points.length > 0) {
            await client.upsert(COLLECTION_NAME, {
                wait: true,
                points: points
            });
            console.log(`   ⬆️  Uploaded final batch of ${points.length} points`);
        }
        
        // Get collection info
        const collectionInfo = await client.getCollection(COLLECTION_NAME);
        console.log(`\n🎉 Upload completed successfully!`);
        console.log(`📊 Total points uploaded: ${totalPoints}`);
        console.log(`📈 Collection status:`, collectionInfo.status);
        console.log(`🔢 Points count in collection:`, collectionInfo.points_count);
        
        return {
            success: true,
            totalPoints,
            collectionInfo
        };
        
    } catch (error) {
        console.error('❌ Error uploading document:', error);
        throw error;
    }
}

// Function to search the knowledge base
async function searchKnowledgeBase(query, limit = 5) {
    try {
        // Check if Qdrant client is available
        if (!client) {
            throw new Error('Qdrant client not available - vector database features are disabled');
        }
        
        console.log(`🔍 Searching for: "${query}"`);
        
        const embedding = await generateEmbedding(query);
        const results = await client.search(COLLECTION_NAME, {
            vector: embedding,
            limit: limit,
            with_payload: true
        });
        
        console.log(`📋 Found ${results.length} results:`);
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. Score: ${result.score.toFixed(4)}`);
            console.log(`   Section: ${result.payload.section_title}`);
            console.log(`   Type: ${result.payload.type}`);
            console.log(`   Technologies: ${result.payload.technologies?.join(', ') || 'None'}`);
            console.log(`   Content: ${result.payload.content.substring(0, 200)}...`);
        });
        
        return results;
    } catch (error) {
        console.error('❌ Error searching knowledge base:', error);
        throw error;
    }
}

// Function to get collection statistics
async function getCollectionStats() {
    try {
        // Check if Qdrant client is available
        if (!client) {
            return {
                available: false,
                message: 'Qdrant client not available - vector database features are disabled',
                points_count: 0
            };
        }
        
        const collections = await client.getCollections();
        console.log('📊 Available collections:', collections.collections.map(c => c.name));
        
        if (collections.collections.find(c => c.name === COLLECTION_NAME)) {
            const info = await client.getCollection(COLLECTION_NAME);
            console.log(`\n📈 Collection '${COLLECTION_NAME}' statistics:`);
            console.log(`   Points count: ${info.points_count}`);
            console.log(`   Status: ${info.status}`);
            console.log(`   Vector size: ${info.config.params.vectors.size}`);
            console.log(`   Distance metric: ${info.config.params.vectors.distance}`);
        }
    } catch (error) {
        console.error('❌ Error getting collection stats:', error);
    }
}

// Export functions for use in other modules
export {
    uploadDocumentToQdrant,
    searchKnowledgeBase,
    getCollectionStats,
    generateEmbedding,
    chunkText,
    client
};