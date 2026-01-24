import Groq from 'groq-sdk';
import { QdrantClient } from '@qdrant/js-client-rest';

class AIChatService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    
    this.qdrant = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    
    this.collectionName = process.env.QDRANT_COLLECTION_NAME;
  }

  // Generate embeddings using the same hash-based approach as vectordb.js
  async generateEmbedding(text) {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0);
    
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

  // Search the vector database for relevant context
  async searchKnowledgeBase(query, limit = 5) {
    try {
      const embedding = await this.generateEmbedding(query);
      
      const results = await this.qdrant.search(this.collectionName, {
        vector: embedding,
        limit: limit,
        with_payload: true,
        score_threshold: 0.1 // Only return results with decent similarity
      });

      return results.map(result => ({
        content: result.payload.content,
        section: result.payload.section_title,
        type: result.payload.type,
        technologies: result.payload.technologies || [],
        score: result.score
      }));
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
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
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        stream: false
      });

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
      const collections = await this.qdrant.getCollections();
      const hasCollection = collections.collections.some(c => c.name === this.collectionName);
      
      return {
        qdrant: hasCollection ? 'connected' : 'collection_not_found',
        groq: 'connected'
      };
    } catch (error) {
      return {
        qdrant: 'error',
        groq: 'unknown',
        error: error.message
      };
    }
  }
}

export default new AIChatService();