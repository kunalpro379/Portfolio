import Groq from 'groq-sdk';
import { KnowledgeBase } from '../models/KnowledgeBase.js';
import { BlobServiceClient } from '@azure/storage-blob';
import { searchKnowledgeBase, generateEmbedding, client as qdrantClient } from '../../vectordb.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

class AIChatService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    
    // Initialize Azure Blob Service for reading uploaded files
    this.blobServiceClient = null;
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
      try {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
      } catch (error) {
        console.warn('Azure Blob Service not available:', error.message);
      }
    }
    
    this.containerName = 'knowledge-base';
    
    // Enhanced conversation memory with session management
    this.conversationMemory = new Map(); // sessionId -> conversation data
    this.sessionStats = new Map(); // sessionId -> session statistics
    this.maxMemorySize = 50; // Maximum active sessions
    this.maxMessagesPerSession = 4; // Keep last 3-4 messages per session
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes session timeout
    this.cleanupInterval = 10 * 60 * 1000; // Cleanup every 10 minutes
    
    // Structured data cache for quick access
    this.structuredDataCache = new Map();
    
    // Start periodic cleanup
    this.startMemoryCleanup();
    
    // Load structured data on startup
    this.loadStructuredData();
  }

  // Load structured data (timetables, schedules, etc.)
  async loadStructuredData() {
    try {
      // Load timetable data
      const timetablePath = path.join(process.cwd(), 'data', 'timetable.json');
      try {
        const timetableData = await fs.readFile(timetablePath, 'utf8');
        this.structuredDataCache.set('timetable', JSON.parse(timetableData));
        console.log('✅ Timetable data loaded successfully');
      } catch (error) {
        console.warn('⚠️ Timetable data not found:', error.message);
      }
      
      // Load other structured data files
      const dataDir = path.join(process.cwd(), 'data');
      try {
        const files = await fs.readdir(dataDir);
        for (const file of files) {
          if (file.endsWith('.json') && file !== 'timetable.json') {
            try {
              const filePath = path.join(dataDir, file);
              const data = await fs.readFile(filePath, 'utf8');
              const key = file.replace('.json', '');
              this.structuredDataCache.set(key, JSON.parse(data));
              console.log(`✅ Loaded structured data: ${key}`);
            } catch (fileError) {
              console.warn(`⚠️ Failed to load ${file}:`, fileError.message);
            }
          }
        }
      } catch (dirError) {
        console.warn('⚠️ Data directory not found, creating it...');
        await fs.mkdir(dataDir, { recursive: true });
      }
    } catch (error) {
      console.error('❌ Error loading structured data:', error);
    }
  }

  // Query structured data (like timetables)
  queryStructuredData(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Check for time-related queries
    const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm)?/gi;
    const dayPattern = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi;
    
    const timeMatches = query.match(timePattern);
    const dayMatches = query.match(dayPattern);
    
    // Query timetable data
    if (this.structuredDataCache.has('timetable')) {
      const timetable = this.structuredDataCache.get('timetable');
      
      if (dayMatches && dayMatches.length > 0) {
        const day = dayMatches[0].toLowerCase();
        const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
        
        if (timetable.timetable && timetable.timetable[dayCapitalized]) {
          const daySchedule = timetable.timetable[dayCapitalized];
          
          if (timeMatches && timeMatches.length > 0) {
            // Find specific time slot
            const queryTime = timeMatches[0];
            const matchingClass = daySchedule.find(classItem => 
              classItem.time && classItem.time.includes(queryTime.replace(/\s/g, ''))
            );
            
            if (matchingClass) {
              results.push({
                type: 'timetable',
                data: matchingClass,
                context: `${dayCapitalized} at ${queryTime}`,
                relevance: 1.0
              });
            }
          } else {
            // Return all classes for the day
            results.push({
              type: 'timetable',
              data: daySchedule,
              context: `All classes on ${dayCapitalized}`,
              relevance: 0.8
            });
          }
        }
      }
    }
    
    // Query other structured data
    for (const [key, data] of this.structuredDataCache.entries()) {
      if (key === 'timetable') continue; // Already handled above
      
      const dataStr = JSON.stringify(data).toLowerCase();
      if (dataStr.includes(queryLower)) {
        results.push({
          type: key,
          data: data,
          context: `Information from ${key}`,
          relevance: 0.6
        });
      }
    }
    
    return results;
  }

  // Session Management Methods
  
  // Generate new session ID
  generateSessionId() {
    return uuidv4();
  }

  // Initialize or get session
  initializeSession(sessionId = null) {
    if (!sessionId) {
      sessionId = this.generateSessionId();
    }

    if (!this.conversationMemory.has(sessionId)) {
      this.conversationMemory.set(sessionId, {
        messages: [],
        createdAt: Date.now(),
        lastActivity: Date.now(),
        messageCount: 0
      });

      this.sessionStats.set(sessionId, {
        totalQueries: 0,
        successfulResponses: 0,
        averageResponseTime: 0,
        topicsDiscussed: new Set(),
        createdAt: Date.now()
      });

      console.log(`🆕 New session created: ${sessionId}`);
    }

    // Update last activity
    const session = this.conversationMemory.get(sessionId);
    session.lastActivity = Date.now();

    return sessionId;
  }

  // Add message to session memory
  addToSessionMemory(sessionId, role, content, metadata = {}) {
    const session = this.conversationMemory.get(sessionId);
    if (!session) return;

    const message = {
      role, // 'user' or 'assistant'
      content,
      timestamp: Date.now(),
      metadata
    };

    session.messages.push(message);
    session.messageCount++;
    session.lastActivity = Date.now();

    // Keep only last N messages
    if (session.messages.length > this.maxMessagesPerSession) {
      session.messages = session.messages.slice(-this.maxMessagesPerSession);
    }

    // Update stats
    const stats = this.sessionStats.get(sessionId);
    if (stats && role === 'user') {
      stats.totalQueries++;
      
      // Extract topics from user message
      const topics = this.extractTopicsFromMessage(content);
      topics.forEach(topic => stats.topicsDiscussed.add(topic));
    }
  }

  // Get session conversation history
  getSessionHistory(sessionId) {
    const session = this.conversationMemory.get(sessionId);
    return session ? session.messages : [];
  }

  // Extract topics from message for stats
  extractTopicsFromMessage(message) {
    const topics = [];
    const messageLower = message.toLowerCase();
    
    // Technical topics
    const techTopics = {
      'projects': ['project', 'work', 'built', 'developed', 'created'],
      'skills': ['skill', 'technology', 'programming', 'language', 'framework'],
      'experience': ['experience', 'job', 'work', 'career', 'professional'],
      'education': ['education', 'degree', 'college', 'university', 'study'],
      'ai_ml': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural'],
      'web_dev': ['web', 'frontend', 'backend', 'fullstack', 'react', 'node'],
      'cloud': ['aws', 'azure', 'cloud', 'docker', 'kubernetes'],
      'database': ['database', 'mongodb', 'mysql', 'sql', 'data']
    };

    for (const [topic, keywords] of Object.entries(techTopics)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  // Start periodic memory cleanup
  startMemoryCleanup() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);

    console.log(`🧹 Memory cleanup scheduled every ${this.cleanupInterval / 1000 / 60} minutes`);
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    // Remove expired sessions
    for (const [sessionId, session] of this.conversationMemory.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.conversationMemory.delete(sessionId);
        this.sessionStats.delete(sessionId);
        cleanedCount++;
      }
    }

    // If still too many sessions, remove oldest ones
    if (this.conversationMemory.size > this.maxMemorySize) {
      const sessions = Array.from(this.conversationMemory.entries())
        .sort(([,a], [,b]) => a.lastActivity - b.lastActivity);
      
      const toRemove = sessions.slice(0, sessions.length - this.maxMemorySize);
      toRemove.forEach(([sessionId]) => {
        this.conversationMemory.delete(sessionId);
        this.sessionStats.delete(sessionId);
        cleanedCount++;
      });
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions. Active sessions: ${this.conversationMemory.size}`);
    }
  }

  // Get session statistics
  getSessionStats(sessionId) {
    const stats = this.sessionStats.get(sessionId);
    const session = this.conversationMemory.get(sessionId);
    
    if (!stats || !session) return null;

    return {
      sessionId,
      totalQueries: stats.totalQueries,
      successfulResponses: stats.successfulResponses,
      messageCount: session.messageCount,
      topicsDiscussed: Array.from(stats.topicsDiscussed),
      sessionDuration: Date.now() - stats.createdAt,
      lastActivity: session.lastActivity,
      isActive: Date.now() - session.lastActivity < this.sessionTimeout
    };
  }

  // Get all active sessions stats
  getAllSessionsStats() {
    const allStats = [];
    for (const sessionId of this.conversationMemory.keys()) {
      const stats = this.getSessionStats(sessionId);
      if (stats) allStats.push(stats);
    }
    return allStats.sort((a, b) => b.lastActivity - a.lastActivity);
  }
  // Enhanced search using vector database with fallback to text search
  async searchKnowledgeBase(query, limit = 5) {
    try {
      console.log(`🔍 Searching knowledge base for: "${query}"`);
      
      // First check structured data
      const structuredResults = this.queryStructuredData(query);
      if (structuredResults.length > 0) {
        console.log(`📊 Found ${structuredResults.length} structured data results`);
        return structuredResults.map(result => ({
          content: this.formatStructuredData(result),
          section: result.context,
          type: result.type,
          technologies: [],
          score: result.relevance,
          metadata: {
            structured: true,
            dataType: result.type
          }
        }));
      }
      
      // Then try vector search if Qdrant is available
      if (qdrantClient) {
        try {
          console.log('📊 Using vector search with Qdrant');
          const vectorResults = await searchKnowledgeBase(query, limit);
          
          if (vectorResults && vectorResults.length > 0) {
            console.log(`✅ Found ${vectorResults.length} vector results`);
            return vectorResults.map(result => ({
              content: result.payload.content,
              section: result.payload.section_title || result.payload.section || 'Unknown Section',
              type: result.payload.type || 'general',
              technologies: result.payload.technologies || [],
              score: result.score,
              metadata: {
                chunk_index: result.payload.chunk_index,
                word_count: result.payload.word_count,
                section_index: result.payload.section_index
              }
            }));
          }
        } catch (vectorError) {
          console.warn('⚠️ Vector search failed, falling back to text search:', vectorError.message);
        }
      }
      
      // Fallback to enhanced text search
      console.log('📝 Using enhanced text search fallback');
      return await this.enhancedTextSearch(query, limit);
      
    } catch (error) {
      console.error('❌ Error in searchKnowledgeBase:', error);
      return [];
    }
  }

  // Format structured data for display
  formatStructuredData(result) {
    if (result.type === 'timetable') {
      if (Array.isArray(result.data)) {
        // Multiple classes
        return result.data.map(classItem => 
          `Time: ${classItem.time}\nSubject: ${classItem.subject}\nRoom: ${classItem.room}\nTeacher: ${classItem.teacher || 'TBA'}\nNote: ${classItem.note || 'None'}`
        ).join('\n\n');
      } else {
        // Single class
        const classItem = result.data;
        return `Time: ${classItem.time}\nSubject: ${classItem.subject}\nRoom: ${classItem.room}\nTeacher: ${classItem.teacher || 'TBA'}\nNote: ${classItem.note || 'None'}`;
      }
    }
    
    return JSON.stringify(result.data, null, 2);
  }

  // Enhanced text search with better scoring and context extraction
  async enhancedTextSearch(query, limit = 5) {
    try {
      // Get all completed files from MongoDB
      const files = await KnowledgeBase.find({ 
        status: 'completed' 
      }).sort({ createdAt: -1 });
      
      if (files.length === 0) {
        console.log('📭 No completed files found in knowledge base');
        return [];
      }
      
      const results = [];
      const queryLower = query.toLowerCase();
      const queryWords = this.extractKeywords(query);
      
      console.log(`🔤 Extracted keywords: ${queryWords.join(', ')}`);
      
      // Search through each file's content
      for (const file of files) {
        try {
          // Download file content from Azure Blob Storage
          if (!this.blobServiceClient) continue;
          
          const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
          const blockBlobClient = containerClient.getBlockBlobClient(file.azureBlobPath);
          
          const downloadResponse = await blockBlobClient.download();
          const content = await this.streamToString(downloadResponse.readableStreamBody);
          
          // Enhanced scoring algorithm
          const searchResult = this.scoreContent(content, queryWords, query);
          
          if (searchResult.score > 0) {
            results.push({
              content: searchResult.snippet,
              section: file.fileName,
              type: this.inferContentType(file.fileName, content),
              technologies: this.extractTechnologies(content),
              score: searchResult.score,
              fullContent: content,
              metadata: {
                file_size: content.length,
                match_count: searchResult.matchCount
              }
            });
          }
        } catch (fileError) {
          console.warn(`⚠️ Error reading file ${file.fileName}:`, fileError.message);
        }
      }
      
      // Sort by score and return top results
      const sortedResults = results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
        
      console.log(`📋 Found ${sortedResults.length} text search results`);
      return sortedResults;
        
    } catch (error) {
      console.error('❌ Error in enhanced text search:', error);
      return [];
    }
  }

  // Extract meaningful keywords from query
  extractKeywords(query) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .map(word => word.replace(/[^\w]/g, ''));
  }

  // Advanced content scoring with multiple factors
  scoreContent(content, keywords, originalQuery) {
    const contentLower = content.toLowerCase();
    let totalScore = 0;
    let matchCount = 0;
    const matches = [];
    
    // Exact phrase matching (highest weight)
    if (contentLower.includes(originalQuery.toLowerCase())) {
      totalScore += 10;
      matchCount++;
    }
    
    // Individual keyword matching with position weighting
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const keywordMatches = content.match(regex) || [];
      
      if (keywordMatches.length > 0) {
        // More matches = higher score, but with diminishing returns
        const keywordScore = Math.min(keywordMatches.length * 2, 8);
        totalScore += keywordScore;
        matchCount += keywordMatches.length;
        
        // Find first match for snippet extraction
        const firstMatch = contentLower.indexOf(keyword);
        if (firstMatch !== -1) {
          matches.push({ keyword, position: firstMatch });
        }
      }
    }
    
    // Technology and skill matching bonus
    const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'aws', 'docker', 'kubernetes', 'mongodb', 'mysql', 'ai', 'machine learning', 'deep learning'];
    for (const tech of techKeywords) {
      if (keywords.some(k => k.includes(tech)) && contentLower.includes(tech)) {
        totalScore += 3;
      }
    }
    
    // Extract best snippet around matches
    let snippet = '';
    if (matches.length > 0) {
      const bestMatch = matches.sort((a, b) => a.position - b.position)[0];
      const snippetStart = Math.max(0, bestMatch.position - 150);
      const snippetEnd = Math.min(content.length, bestMatch.position + 300);
      snippet = content.substring(snippetStart, snippetEnd).trim();
      
      // Add ellipsis if truncated
      if (snippetStart > 0) snippet = '...' + snippet;
      if (snippetEnd < content.length) snippet = snippet + '...';
    } else if (content.length > 300) {
      snippet = content.substring(0, 300) + '...';
    } else {
      snippet = content;
    }
    
    return {
      score: totalScore,
      snippet,
      matchCount
    };
  }

  // Infer content type from filename and content
  inferContentType(filename, content) {
    const lower = filename.toLowerCase();
    if (lower.includes('project')) return 'project';
    if (lower.includes('blog')) return 'blog';
    if (lower.includes('doc')) return 'documentation';
    if (lower.includes('code')) return 'code';
    
    // Analyze content for type hints
    if (content.includes('Technology Stack:') || content.includes('GitHub:')) return 'project';
    if (content.includes('Blog') || content.includes('January') || content.includes('2026')) return 'blog';
    if (content.includes('Experience') || content.includes('Duration:')) return 'experience';
    if (content.includes('Education') || content.includes('CGPA')) return 'education';
    
    return 'general';
  }

  // Extract technologies mentioned in content
  extractTechnologies(content) {
    const techKeywords = [
      'JavaScript', 'Python', 'Java', 'C++', 'Node.js', 'React', 'AWS', 'Docker', 
      'Kubernetes', 'MongoDB', 'MySQL', 'Redis', 'Spring Boot', 'TypeScript',
      'Machine Learning', 'AI', 'Deep Learning', 'GAN', 'LSTM', 'ARIMA',
      'Azure', 'Linux', 'Kafka', 'GraphQL', 'Firebase', 'PyTorch', 'TensorFlow',
      'Express', 'FastAPI', 'PostgreSQL', 'Elasticsearch', 'Jenkins', 'Git'
    ];
    
    return techKeywords.filter(tech => 
      content.toLowerCase().includes(tech.toLowerCase())
    );
  }
  
  // Helper function to convert stream to string
  async streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data.toString());
      });
      readableStream.on('end', () => {
        resolve(chunks.join(''));
      });
      readableStream.on('error', reject);
    });
  }

  // Generate AI response using Groq with RAG context and conversation history
  async generateResponse(userQuery, context = [], sessionId = null) {
    try {
      // Get conversation history for context
      const conversationHistory = sessionId ? this.getSessionHistory(sessionId) : [];
      
      // Prepare context from search results
      const contextText = context
        .map(item => `Section: ${item.section}\nContent: ${item.content}`)
        .join('\n\n---\n\n');

      // Prepare conversation context
      const conversationContext = conversationHistory.length > 0 
        ? conversationHistory
            .slice(-3) // Last 3 messages for context
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n')
        : '';

      // Check if this is a structured data query (like timetable)
      const hasStructuredData = context.some(item => item.metadata && item.metadata.structured);

      const systemPrompt = hasStructuredData 
        ? `You are Kunal Patil's AI assistant with access to his class timetable and schedule information.

Your role is to:
- Answer questions about class schedules, timetables, and academic information
- Provide specific details about classes, timings, rooms, and teachers
- Help with schedule-related queries
- Be conversational, helpful, and accurate
- Always base your answers on the provided timetable data
- Remember the conversation context and provide coherent follow-up responses

Timetable Context:
${contextText}

${conversationContext ? `Recent Conversation Context:\n${conversationContext}\n` : ''}

Guidelines:
- If the question is about class schedules or timetables, use the context to provide exact details
- Include specific information like time, subject, room, and teacher when available
- If you don't have the specific information requested, say so clearly
- Keep responses concise but complete
- Use a friendly, helpful tone
- If asked about non-academic topics, politely redirect to schedule-related information`
        : `You are Kunal Patil's AI assistant. You have access to detailed information about Kunal's background, projects, skills, and experience. 

Your role is to:
- Answer questions about Kunal's professional background, projects, and skills
- Provide specific details about his work experience and achievements
- Help visitors understand his technical expertise and capabilities
- Be conversational, helpful, and professional
- Always base your answers on the provided context information
- Remember the conversation context and provide coherent follow-up responses

Knowledge Base Context:
${contextText}

${conversationContext ? `Recent Conversation Context:\n${conversationContext}\n` : ''}

Guidelines:
- If the question is about Kunal's work, projects, or background, use the context to provide detailed answers
- If you don't have specific information in the context, say so politely
- Keep responses concise but informative (max 200 words unless specifically asked for details)
- Use a friendly, professional tone
- Highlight relevant technologies and achievements when appropriate
- Reference previous conversation when relevant
- If asked about class schedules or timetables, politely redirect to Kunal's professional information`;

      console.log('🤖 Making Groq API call with model: llama-3.1-8b-instant');
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userQuery
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        stream: false
      });

      console.log('✅ Groq API call successful');

      return {
        response: completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
        contextUsed: context.length > 0,
        conversationContextUsed: conversationHistory.length > 0,
        sources: context.map(item => ({
          section: item.section,
          type: item.type,
          technologies: item.technologies
        }))
      };
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      throw new Error('Failed to generate response');
    }
  }

  // Main chat method that combines search, generation, and session management
  async chat(userQuery, sessionId = null) {
    const startTime = Date.now();
    
    try {
      // Initialize or get session
      sessionId = this.initializeSession(sessionId);
      
      console.log(`💬 Processing chat for session: ${sessionId}`);
      console.log(`📝 User query: "${userQuery}"`);
      
      // Add user message to session memory
      this.addToSessionMemory(sessionId, 'user', userQuery);
      
      // Search for relevant context
      console.log('🔍 Searching knowledge base...');
      const context = await this.searchKnowledgeBase(userQuery, 3);
      
      // Generate response with context and conversation history
      console.log('🤖 Generating AI response...');
      const result = await this.generateResponse(userQuery, context, sessionId);
      
      // Add assistant response to session memory
      this.addToSessionMemory(sessionId, 'assistant', result.response, {
        contextUsed: result.contextUsed,
        conversationContextUsed: result.conversationContextUsed,
        sourcesCount: result.sources.length
      });
      
      // Update session stats
      const stats = this.sessionStats.get(sessionId);
      if (stats) {
        stats.successfulResponses++;
        const responseTime = Date.now() - startTime;
        stats.averageResponseTime = stats.averageResponseTime === 0 
          ? responseTime 
          : (stats.averageResponseTime + responseTime) / 2;
      }
      
      console.log(`✅ Chat completed in ${Date.now() - startTime}ms`);
      
      return {
        success: true,
        message: result.response,
        sessionId: sessionId,
        contextUsed: result.contextUsed,
        conversationContextUsed: result.conversationContextUsed,
        sources: result.sources,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      // Still add error to session if session exists
      if (sessionId && this.conversationMemory.has(sessionId)) {
        this.addToSessionMemory(sessionId, 'assistant', "I'm sorry, I'm having trouble processing your request right now. Please try again later.", {
          error: true,
          errorMessage: error.message
        });
      }
      
      return {
        success: false,
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        sessionId: sessionId,
        error: error.message,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Enhanced health check method with session statistics
  async healthCheck() {
    try {
      const fileCount = await KnowledgeBase.countDocuments({ status: 'completed' });
      const activeSessions = this.conversationMemory.size;
      const totalSessions = this.sessionStats.size;
      
      // Calculate total queries across all sessions
      let totalQueries = 0;
      let totalSuccessfulResponses = 0;
      const topicsDiscussed = new Set();
      
      for (const stats of this.sessionStats.values()) {
        totalQueries += stats.totalQueries;
        totalSuccessfulResponses += stats.successfulResponses;
        stats.topicsDiscussed.forEach(topic => topicsDiscussed.add(topic));
      }
      
      return {
        knowledgeBase: fileCount > 0 ? 'files_available' : 'no_files',
        groq: 'connected',
        azure: this.blobServiceClient ? 'connected' : 'not_configured',
        qdrant: qdrantClient ? 'connected' : 'not_available',
        fileCount,
        sessions: {
          active: activeSessions,
          total: totalSessions,
          totalQueries,
          totalSuccessfulResponses,
          successRate: totalQueries > 0 ? (totalSuccessfulResponses / totalQueries * 100).toFixed(2) + '%' : '0%',
          topicsDiscussed: Array.from(topicsDiscussed)
        },
        memory: {
          maxSessions: this.maxMemorySize,
          maxMessagesPerSession: this.maxMessagesPerSession,
          sessionTimeoutMinutes: this.sessionTimeout / 1000 / 60,
          cleanupIntervalMinutes: this.cleanupInterval / 1000 / 60
        }
      };
    } catch (error) {
      return {
        knowledgeBase: 'error',
        groq: 'unknown',
        azure: 'unknown',
        qdrant: 'unknown',
        sessions: { active: 0, total: 0, error: true },
        error: error.message
      };
    }
  }
}

export default new AIChatService();