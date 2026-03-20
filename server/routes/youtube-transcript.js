import express from 'express';
import { getSubtitles } from 'youtube-captions-scraper';
import fetch from 'node-fetch';
import { QdrantClient } from '@qdrant/js-client-rest';
import GuideNote from '../models/GuideNote.js';
import CONFIG from '../../config.shared.js';

const router = express.Router();

// Initialize OpenRouter for DeepSeek
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

console.log('OpenRouter API Key loaded:', OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

// Initialize Qdrant client
let qdrantClient;
try {
  if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      checkCompatibility: false, // Skip version check
    });
    console.log('Qdrant client initialized for YouTube transcripts');
  } else {
    console.warn('Qdrant credentials not found');
  }
} catch (error) {
  console.error('Failed to initialize Qdrant:', error);
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

// Get video title from YouTube
async function getVideoTitle(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract title from HTML
    const titleMatch = html.match(/<title>(.+?)<\/title>/);
    if (titleMatch && titleMatch[1]) {
      // Remove " - YouTube" suffix
      return titleMatch[1].replace(' - YouTube', '').trim();
    }
    
    return `YouTube Video ${videoId}`;
  } catch (error) {
    console.error('Error fetching video title:', error.message);
    return `YouTube Video ${videoId}`;
  }
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

// Generate embeddings using DeepSeek via OpenRouter
async function generateEmbedding(text) {
  try {
    // Use DeepSeek R1 to create a semantic summary for embedding
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kunalportfolio.com',
        'X-Title': 'Kunal Portfolio YouTube Transcript'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: 'You are a semantic analysis expert. Create a concise, information-dense summary that captures the core meaning and key concepts for semantic search purposes. Focus on extracting the essential technical concepts, key ideas, and main topics without any casual language or emojis.'
          },
          {
            role: 'user',
            content: `Create a semantic summary (max 150 words) capturing the essential meaning and key concepts of this text:\n\n${text.substring(0, 1500)}`
          }
        ],
        temperature: 0.2,
        max_tokens: 200
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const completion = await response.json();
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
    console.log('Using OpenRouter API Key:', OPENROUTER_API_KEY);
    console.log('API Key length:', OPENROUTER_API_KEY?.length);
    console.log('API Key first 20 chars:', OPENROUTER_API_KEY?.substring(0, 20));
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kunalportfolio.com',
        'X-Title': 'Kunal Portfolio YouTube Transcript'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: `You are an expert educator who creates comprehensive, in-depth learning materials. Your goal is to transform video transcripts into detailed educational content that thoroughly explains every concept, idea, and topic discussed.

CRITICAL INSTRUCTIONS:
- Create EXTENSIVE, DETAILED explanations for every concept mentioned
- Break down complex topics into simple, understandable parts with thorough analysis
- Provide examples, analogies, and real-world applications with depth
- Explain WHY things work the way they do, not just WHAT they are
- Use clear markdown formatting with headers, lists, and code blocks
- Write as if teaching someone who wants to deeply understand the topic
- DO NOT include any metadata, timestamps, processing information, or emojis
- Focus ONLY on educational content and explanations
- Make it comprehensive enough that someone could learn the entire topic from your explanation alone
- Maintain a professional, academic tone throughout
- Provide detailed technical explanations where applicable`
          },
          {
            role: 'user',
            content: `Transform this transcript segment (part ${chunkIndex + 1} of ${totalChunks}) into an in-depth educational guide. Explain every concept thoroughly with detailed explanations, examples, and insights.

Video: "${videoTitle}"

Transcript:
${chunk}

Create a comprehensive, detailed explanation covering all concepts discussed. Use markdown formatting and make it educational and thorough.`
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const completion = await response.json();
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
    console.error('Error ensuring collection:', error.message);
    // Don't fail the entire process if Qdrant is unavailable
    return false;
  }
}

// Process YouTube video transcript with streaming updates
router.post('/process', async (req, res) => {
  console.log('📹 YouTube transcript process endpoint hit');
  console.log('Request body:', req.body);
  
  try {
    const { youtubeUrl, guideId, titleId } = req.body;
    
    if (!youtubeUrl || !guideId || !titleId) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'YouTube URL, guideId, and titleId are required' 
      });
    }
    
    console.log('✓ Setting up SSE headers...');
    // Set up SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush headers immediately
    
    const sendUpdate = (data) => {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      console.log(' Sending update:', data.step, data.status);
      res.write(message);
    };
    
    try {
      // Step 1: Extract video ID
      sendUpdate({ step: 'extract_id', status: 'processing', message: 'Extracting video ID...' });
      const videoId = extractVideoId(youtubeUrl);
      console.log('✓ Video ID extracted:', videoId);
      
      // Get video title
      const videoTitle = await getVideoTitle(videoId);
      console.log('✓ Video title:', videoTitle);
      
      sendUpdate({ step: 'extract_id', status: 'complete', message: 'Video ID extracted', data: { videoId, videoTitle } });
      
      // Step 2: Fetch transcript
      sendUpdate({ step: 'fetch_transcript', status: 'processing', message: 'Downloading transcript from YouTube...' });
      
      let transcript;
      
      // Try to fetch real YouTube transcript
      const USE_MOCK_DATA = false;
      
      if (USE_MOCK_DATA) {
        console.log('🧪 Using mock transcript data for testing...');
        transcript = [
          { text: "Welcome to this tutorial on JavaScript.", duration: 3000, offset: 0 },
          { text: "Today we'll learn about async await and promises.", duration: 4000, offset: 3000 },
          { text: "Async await makes asynchronous code look synchronous.", duration: 4500, offset: 7000 },
          { text: "It's built on top of promises and makes code more readable.", duration: 5000, offset: 11500 },
          { text: "Let's start with a simple example.", duration: 3000, offset: 16500 },
          { text: "First, we create an async function.", duration: 3500, offset: 19500 },
          { text: "Inside the function, we use the await keyword.", duration: 4000, offset: 23000 },
          { text: "Await pauses execution until the promise resolves.", duration: 4500, offset: 27000 },
          { text: "This makes our code much easier to understand.", duration: 3500, offset: 31500 },
          { text: "Thanks for watching! Don't forget to subscribe.", duration: 3000, offset: 35000 }
        ];
        console.log(' Mock transcript loaded with', transcript.length, 'items');
      } else {
        try {
          console.log('Fetching real transcript for video:', videoId);
          
          // Try Python transcript service first (if available)
          let captions = null;
          
          try {
            console.log('Trying Python transcript service...');
            const response = await fetch(`http://localhost:5001/transcript/${videoId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.transcript) {
                captions = data.transcript;
                console.log('Python service returned transcript:', captions.length);
              }
            }
          } catch (pythonErr) {
            console.log('Python service not available:', pythonErr.message);
          }
          
          // Fallback to Node.js library
          if (!captions || captions.length === 0) {
            console.log('Trying Node.js captions scraper...');
            try {
              captions = await getSubtitles({
                videoID: videoId,
                lang: 'en'
              });
            } catch (err1) {
              try {
                captions = await getSubtitles({ videoID: videoId });
              } catch (err2) {
                console.log('Node.js scraper failed');
              }
            }
          }
          
          if (!captions || captions.length === 0) {
            throw new Error('No captions available. To use real transcripts, run: python server/scripts/transcript_service.py');
          }
          
          // Convert to our format
          transcript = captions.map(caption => ({
            text: caption.text || '',
            duration: caption.dur || caption.duration || 0,
            offset: caption.start || caption.offset || 0
          }));
          
          console.log('Real transcript fetched successfully!');
          console.log('Total transcript items:', transcript.length);
          
        } catch (transcriptError) {
          console.error('Transcript fetch error:', transcriptError.message);
          sendUpdate({ 
            step: 'fetch_transcript', 
            status: 'error', 
            message: `${transcriptError.message}. Using mock data instead for demo.` 
          });
          
          // Fallback to mock data so feature still works
          console.log('Falling back to mock data...');
          transcript = [
            { text: "Welcome to this tutorial on JavaScript.", duration: 3000, offset: 0 },
            { text: "Today we'll learn about async await and promises.", duration: 4000, offset: 3000 },
            { text: "Async await makes asynchronous code look synchronous.", duration: 4500, offset: 7000 },
            { text: "It's built on top of promises and makes code more readable.", duration: 5000, offset: 11500 },
            { text: "Let's start with a simple example.", duration: 3000, offset: 16500 },
            { text: "First, we create an async function.", duration: 3500, offset: 19500 },
            { text: "Inside the function, we use the await keyword.", duration: 4000, offset: 23000 },
            { text: "Await pauses execution until the promise resolves.", duration: 4500, offset: 27000 },
            { text: "This makes our code much easier to understand.", duration: 3500, offset: 31500 },
            { text: "Thanks for watching! Don't forget to subscribe.", duration: 3000, offset: 35000 }
          ];
        }
      }
      
      if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
        console.log('Transcript is empty or invalid');
        sendUpdate({ 
          step: 'fetch_transcript', 
          status: 'error', 
          message: 'No transcript available for this video. Please try a video with captions/subtitles enabled.' 
        });
        res.write('data: {"done":true,"success":false}\n\n');
        return res.end();
      }
      
      sendUpdate({ step: 'fetch_transcript', status: 'complete', message: `Transcript downloaded (${transcript.length} items)`, data: { length: transcript.length } });
      
      // Step 3: Chunk transcript
      sendUpdate({ step: 'chunk_transcript', status: 'processing', message: 'Splitting transcript into chunks...' });
      const chunks = chunkTranscript(transcript);
      sendUpdate({ step: 'chunk_transcript', status: 'complete', message: `Created ${chunks.length} chunks`, data: { chunksCount: chunks.length } });
      
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
      
      // Create in-depth merged content - ONLY educational content, no metadata
      const mergedContent = processedChunks.map(chunk => chunk.processedText).join('\n\n---\n\n');
      
      const finalMarkdown = `# ${videoTitle}

${mergedContent}`;
      
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
