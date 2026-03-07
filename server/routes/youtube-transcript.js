import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { Groq } from 'groq-sdk';
import { QdrantClient } from '@qdrant/js-client-rest';
import GuideNote from '../models/GuideNote.js';
import CONFIG from '../../config.shared.js';

const router = express.Router();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Initialize Qdrant client
let qdrantClient;
try {
  if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    console.log('✓ Qdrant client initialized for YouTube transcripts');
  } else {
    console.warn('⚠ Qdrant credentials not found');
  }
} catch (error) {
  console.error('✗ Failed to initialize Qdrant:', error);
}

const COLLECTION_NAME = 'youtube_transcripts';

// Helper function to get allowed origin for CORS
const getAllowedOrigin = (origin) => {
  if (!origin) return null;
  if (CONFIG.CORS.ORIGINS.includes(origin)) {
    return origin;
  }
  return null;
};

// Middleware to set CORS headers
const setCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin);
  
  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
};

router.use(setCorsHeaders);

// Handle OPTIONS requests for CORS
router.options('*', (req, res) => {
  res.sendStatus(200);
});

// Extract video ID from YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  throw new Error('Invalid YouTube URL');
}

// Chunk transcript into smaller pieces
function chunkTranscript(transcript, maxChunkSize = 2000) {
  const chunks = [];
  let currentChunk = '';
  
  for (const item of transcript) {
    const text = item.text + ' ';
    
    if ((currentChunk + text).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = text;
    } else {
      currentChunk += text;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Generate embeddings using Groq
async function generateEmbedding(text) {
  try {
    // Use Groq's llama-3.3-70b-versatile to create a semantic summary for embedding
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a semantic analysis expert. Create a concise, information-dense summary that captures the core meaning and key concepts for semantic search purposes.'
        },
        {
          role: 'user',
          content: `Create a semantic summary (max 150 words) capturing the essential meaning and key concepts of this text:\n\n${text.substring(0, 1500)}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 200
    });
    
    const summary = completion.choices[0]?.message?.content || text;
    
    // Create a simple embedding from the summary (word frequency based)
    // In production, you might want to use a dedicated embedding model
    const words = summary.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const embedding = new Array(384).fill(0);
    
    // Use word hashing with better distribution
    words.forEach((word, idx) => {
      const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const position = hash % 384;
      embedding[position] += 1 / (idx + 1); // Weight earlier words more
    });
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
    
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Process chunk with LLM
async function processChunkWithLLM(chunk, chunkIndex, totalChunks, videoTitle) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing video transcripts and creating well-structured, informative markdown documentation. Extract key concepts, explanations, and insights. Be thorough and detailed in your analysis.'
        },
        {
          role: 'user',
          content: `Analyze this transcript chunk (${chunkIndex + 1}/${totalChunks}) from the video "${videoTitle}" and create a detailed markdown section with:

## Analysis Requirements:
- Extract and explain all key concepts and topics discussed
- Provide detailed explanations of important points
- Include any code examples, commands, or technical details mentioned
- Highlight practical takeaways and actionable insights
- Organize information with proper markdown formatting (headers, lists, code blocks)
- Be comprehensive and don't skip important details

## Transcript Chunk:
${chunk}

Provide a well-formatted, detailed markdown response:`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000
    });
    
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error processing chunk with LLM:', error);
    throw error;
  }
}

// Ensure Qdrant collection exists
async function ensureCollection() {
  if (!qdrantClient) return false;
  
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384,
          distance: 'Cosine'
        }
      });
      console.log(`✓ Created collection: ${COLLECTION_NAME}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring collection:', error);
    return false;
  }
}

// Process YouTube video transcript with streaming updates
router.post('/process', async (req, res) => {
  try {
    const { youtubeUrl, guideId, titleId } = req.body;
    
    if (!youtubeUrl || !guideId || !titleId) {
      return res.status(400).json({ 
        success: false,
        message: 'YouTube URL, guideId, and titleId are required' 
      });
    }
    
    // Set up SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendUpdate = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    try {
      // Step 1: Extract video ID
      sendUpdate({ step: 'extract_id', status: 'processing', message: 'Extracting video ID...' });
      const videoId = extractVideoId(youtubeUrl);
      sendUpdate({ step: 'extract_id', status: 'complete', message: 'Video ID extracted', data: { videoId } });
      
      // Step 2: Fetch transcript
      sendUpdate({ step: 'fetch_transcript', status: 'processing', message: 'Downloading transcript from YouTube...' });
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcript || transcript.length === 0) {
        sendUpdate({ step: 'fetch_transcript', status: 'error', message: 'No transcript available' });
        res.write('data: {"done":true,"success":false}\n\n');
        return res.end();
      }
      
      sendUpdate({ step: 'fetch_transcript', status: 'complete', message: 'Transcript downloaded', data: { length: transcript.length } });
      
      // Step 3: Chunk transcript
      sendUpdate({ step: 'chunk_transcript', status: 'processing', message: 'Splitting transcript into chunks...' });
      const chunks = chunkTranscript(transcript);
      sendUpdate({ step: 'chunk_transcript', status: 'complete', message: `Created ${chunks.length} chunks`, data: { chunksCount: chunks.length } });
      
      const videoTitle = `YouTube Video ${videoId}`;
      
      // Step 4: Process each chunk with LLM
      const processedChunks = [];
      for (let i = 0; i < chunks.length; i++) {
        sendUpdate({ 
          step: 'process_chunk', 
          status: 'processing', 
          message: `Processing chunk ${i + 1}/${chunks.length} with AI...`,
          data: { current: i + 1, total: chunks.length }
        });
        
        const processed = await processChunkWithLLM(chunks[i], i, chunks.length, videoTitle);
        processedChunks.push({
          index: i,
          originalText: chunks[i],
          processedText: processed
        });
        
        sendUpdate({ 
          step: 'process_chunk', 
          status: 'complete', 
          message: `Chunk ${i + 1}/${chunks.length} processed`,
          data: { current: i + 1, total: chunks.length }
        });
      }
      
      // Step 5: Generate embeddings and store in VectorDB
      if (qdrantClient && await ensureCollection()) {
        sendUpdate({ step: 'generate_embeddings', status: 'processing', message: 'Generating embeddings...' });
        
        for (let i = 0; i < processedChunks.length; i++) {
          const chunk = processedChunks[i];
          
          sendUpdate({ 
            step: 'generate_embeddings', 
            status: 'processing', 
            message: `Generating embedding ${i + 1}/${processedChunks.length}...`,
            data: { current: i + 1, total: processedChunks.length }
          });
          
          const embedding = await generateEmbedding(chunk.originalText);
          
          await qdrantClient.upsert(COLLECTION_NAME, {
            points: [
              {
                id: `${guideId}_${titleId}_${videoId}_${i}`,
                vector: embedding,
                payload: {
                  guideId,
                  titleId,
                  videoId,
                  videoUrl: youtubeUrl,
                  chunkIndex: i,
                  originalText: chunk.originalText,
                  processedText: chunk.processedText,
                  timestamp: new Date().toISOString()
                }
              }
            ]
          });
          
          sendUpdate({ 
            step: 'generate_embeddings', 
            status: 'complete', 
            message: `Embedding ${i + 1}/${processedChunks.length} stored`,
            data: { current: i + 1, total: processedChunks.length }
          });
        }
        
        sendUpdate({ step: 'generate_embeddings', status: 'complete', message: 'All embeddings stored in VectorDB' });
      }
      
      // Step 6: Merge all chunks into comprehensive markdown
      sendUpdate({ step: 'merge_document', status: 'processing', message: 'Creating comprehensive markdown document...' });
      
      // Create in-depth merged content
      const mergedContent = processedChunks.map(chunk => chunk.processedText).join('\n\n');
      
      const finalMarkdown = `# ${videoTitle}

**Source:** [YouTube Video](${youtubeUrl})  
**Video ID:** \`${videoId}\`  
**Processed:** ${new Date().toLocaleString()}  
**Total Chunks:** ${chunks.length}  
**Embeddings Stored:** ${qdrantClient ? 'Yes ✓' : 'No'}

---

## 📚 Comprehensive Analysis

This document contains an in-depth analysis of the entire video, processed and merged from ${chunks.length} transcript chunks.

${mergedContent}

---

## 📄 Original Transcript

<details>
<summary>Click to expand full transcript (${chunks.length} chunks)</summary>

${chunks.map((chunk, idx) => `### Chunk ${idx + 1}

${chunk}

`).join('\n\n')}

</details>

---

**Processing Details:**
- Total chunks analyzed: ${chunks.length}
- AI Model: llama-3.3-70b-versatile
- Embeddings: ${qdrantClient ? `Stored in VectorDB for semantic search` : 'Not stored'}
- Generated: ${new Date().toISOString()}

**Note:** This document was automatically generated using AI analysis. Each section represents detailed insights extracted and merged from the video transcript.
`;
      
      sendUpdate({ step: 'merge_document', status: 'complete', message: 'Markdown document created' });
      
      // Step 7: Save to database
      sendUpdate({ step: 'save_document', status: 'processing', message: 'Saving document to guide...' });
      
      const guide = await GuideNote.findOne({ guideId });
      if (!guide) {
        sendUpdate({ step: 'save_document', status: 'error', message: 'Guide not found' });
        res.write('data: {"done":true,"success":false}\n\n');
        return res.end();
      }
      
      const title = guide.titles.find(t => t.titleId === titleId);
      if (!title) {
        sendUpdate({ step: 'save_document', status: 'error', message: 'Title not found' });
        res.write('data: {"done":true,"success":false}\n\n');
        return res.end();
      }
      
      const documentId = videoId + '_' + Date.now().toString(36);
      
      const newDoc = {
        documentId,
        name: `YouTube: ${videoTitle}`,
        type: 'markdown',
        content: finalMarkdown,
        metadata: {
          videoId,
          videoUrl: youtubeUrl,
          chunksCount: chunks.length,
          processedAt: new Date().toISOString()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      title.documents.push(newDoc);
      title.updatedAt = new Date();
      await guide.save();
      
      sendUpdate({ step: 'save_document', status: 'complete', message: 'Document saved successfully!' });
      
      // Send final success message
      res.write(`data: ${JSON.stringify({
        done: true,
        success: true,
        document: newDoc,
        stats: {
          videoId,
          chunksProcessed: chunks.length,
          embeddingsStored: qdrantClient ? chunks.length : 0,
          documentCreated: true
        }
      })}\n\n`);
      
      res.end();
      
    } catch (error) {
      console.error('Error in processing:', error);
      sendUpdate({ 
        step: 'error', 
        status: 'error', 
        message: error.message || 'Processing failed' 
      });
      res.write('data: {"done":true,"success":false}\n\n');
      res.end();
    }
    
  } catch (error) {
    console.error('Error processing YouTube transcript:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process YouTube transcript',
      error: error.message 
    });
  }
});

// Query embeddings for a question
router.post('/query', async (req, res) => {
  try {
    const { question, guideId, titleId, limit = 5 } = req.body;
    
    if (!question) {
      return res.status(400).json({ 
        success: false,
        message: 'Question is required' 
      });
    }
    
    if (!qdrantClient) {
      return res.status(503).json({ 
        success: false,
        message: 'Vector database not available' 
      });
    }
    
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    
    // Search in Qdrant
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: questionEmbedding,
      limit,
      filter: guideId && titleId ? {
        must: [
          { key: 'guideId', match: { value: guideId } },
          { key: 'titleId', match: { value: titleId } }
        ]
      } : undefined
    });
    
    // Format results
    const results = searchResult.map(hit => ({
      score: hit.score,
      chunkIndex: hit.payload.chunkIndex,
      text: hit.payload.processedText,
      originalText: hit.payload.originalText,
      videoUrl: hit.payload.videoUrl
    }));
    
    res.json({
      success: true,
      question,
      results
    });
    
  } catch (error) {
    console.error('Error querying embeddings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to query embeddings',
      error: error.message 
    });
  }
});

export default router;
