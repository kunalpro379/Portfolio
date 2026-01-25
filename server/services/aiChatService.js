import Groq from 'groq-sdk';
import { KnowledgeBase } from '../models/KnowledgeBase.js';
import { BlobServiceClient } from '@azure/storage-blob';

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
  }

  // Search the knowledge base using text search through uploaded files
  async searchKnowledgeBase(query, limit = 5) {
    try {
      // Get all completed files from MongoDB
      const files = await KnowledgeBase.find({ 
        status: 'completed' 
      }).sort({ createdAt: -1 });
      
      if (files.length === 0) {
        console.log('No completed files found in knowledge base');
        return [];
      }
      
      const results = [];
      const queryLower = query.toLowerCase();
      
      // Search through each file's content
      for (const file of files) {
        try {
          // Download file content from Azure Blob Storage
          if (!this.blobServiceClient) continue;
          
          const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
          const blockBlobClient = containerClient.getBlockBlobClient(file.azureBlobPath);
          
          const downloadResponse = await blockBlobClient.download();
          const content = await this.streamToString(downloadResponse.readableStreamBody);
          
          // Simple text search - check if query terms appear in content
          const contentLower = content.toLowerCase();
          const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
          
          let matchScore = 0;
          for (const word of queryWords) {
            const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
            matchScore += matches;
          }
          
          if (matchScore > 0) {
            // Extract relevant snippet around the first match
            const firstMatch = queryWords.find(word => contentLower.includes(word));
            const matchIndex = contentLower.indexOf(firstMatch);
            const snippetStart = Math.max(0, matchIndex - 200);
            const snippetEnd = Math.min(content.length, matchIndex + 200);
            const snippet = content.substring(snippetStart, snippetEnd);
            
            results.push({
              content: snippet,
              section: file.fileName,
              type: file.fileType,
              technologies: [],
              score: matchScore / queryWords.length,
              fullContent: content
            });
          }
        } catch (fileError) {
          console.warn(`Error reading file ${file.fileName}:`, fileError.message);
        }
      }
      
      // Sort by score and return top results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
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

  // Generate AI response using Groq with RAG context
  async generateResponse(userQuery, context = []) {
    try {
      // Prepare context from vector search results
      const contextText = context
        .map(item => `Section: ${item.section}\nContent: ${item.content}`)
        .join('\n\n---\n\n');

      const systemPrompt = `You are Kunal Patil's AI assistant. You have access to detailed information about Kunal's background, projects, skills, and experience. 

Your role is to:
- Answer questions about Kunal's professional background, projects, and skills
- Provide specific details about his work experience and achievements
- Help visitors understand his technical expertise and capabilities
- Be conversational, helpful, and professional
- Always base your answers on the provided context information

Context Information:
${contextText}

Guidelines:
- If the question is about Kunal's work, projects, or background, use the context to provide detailed answers
- If you don't have specific information in the context, say so politely
- Keep responses concise but informative
- Use a friendly, professional tone
- Highlight relevant technologies and achievements when appropriate`;

      console.log('Making Groq API call with model: llama-3.1-8b-instant');
      
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
        max_tokens: 1000,
        top_p: 1,
        stream: false
      });

      console.log('Groq API call successful');

      return {
        response: completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
        contextUsed: context.length > 0,
        sources: context.map(item => ({
          section: item.section,
          type: item.type,
          technologies: item.technologies
        }))
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      throw new Error('Failed to generate response');
    }
  }

  // Main chat method that combines search and generation
  async chat(userQuery) {
    try {
      // Search for relevant context
      const context = await this.searchKnowledgeBase(userQuery, 3);
      
      // Generate response with context
      const result = await this.generateResponse(userQuery, context);
      
      return {
        success: true,
        message: result.response,
        contextUsed: result.contextUsed,
        sources: result.sources,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        success: false,
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const fileCount = await KnowledgeBase.countDocuments({ status: 'completed' });
      
      return {
        knowledgeBase: fileCount > 0 ? 'files_available' : 'no_files',
        groq: 'connected',
        azure: this.blobServiceClient ? 'connected' : 'not_configured',
        fileCount
      };
    } catch (error) {
      return {
        knowledgeBase: 'error',
        groq: 'unknown',
        azure: 'unknown',
        error: error.message
      };
    }
  }
}

export default new AIChatService();