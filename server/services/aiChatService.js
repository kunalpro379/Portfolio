import Groq from 'groq-sdk';
import { KnowledgeBase } from '../models/KnowledgeBase.js';
import { BlobServiceClient } from '@azure/storage-blob';
import { searchKnowledgeBase as vectorSearch } from '../../vectordb.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Direct timetable handler for schedule queries
  searchTimetable(query) {
    const timetableData = {
      "college": "Vivekanand Education Society Institute of Technology (VESIT)",
      "branch": "Artificial Intelligence and Data Science (AIDS)",
      "class_division": "D16AD A",
      "timetable": {
        "Monday": [
          {
            "time": "08:30-09:30",
            "subject": "Unknown",
            "room": "B75",
            "teacher": null,
            "note": "Subject not clearly mentioned"
          },
          {
            "time": "09:30-10:30",
            "subject": "AAI (SO)",
            "room": "B74",
            "teacher": "SO"
          },
          {
            "time": "10:30-11:30",
            "subject": "AAI/A/SO",
            "room": "210",
            "teacher": "SO"
          },
          {
            "time": "11:30-12:30",
            "subject": "RL/B/POV + PROJECT/C",
            "room": "211",
            "teacher": "POV"
          },
          {
            "time": "12:30-13:30",
            "subject": "RS/H",
            "room": "B75",
            "teacher": "H"
          },
          {
            "time": "13:30-14:30",
            "subject": "Break",
            "room": null,
            "teacher": null
          },
          {
            "time": "14:30-15:30",
            "subject": "ILOC Practical - AIDS",
            "room": "213",
            "teacher": "EM/AMUDHA",
            "note": "AIDS branch practical session"
          }
        ],
        "Tuesday": [
          {
            "time": "08:30-09:30",
            "subject": "No Lecture",
            "room": null,
            "teacher": null
          },
          {
            "time": "09:30-10:30",
            "subject": "RL (POV)",
            "room": "B75",
            "teacher": "POV"
          },
          {
            "time": "10:30-11:30",
            "subject": "SMA/A22",
            "room": "B61",
            "teacher": "OMK"
          },
          {
            "time": "11:30-12:30",
            "subject": "RS/A11",
            "room": "207",
            "teacher": "HJ"
          },
          {
            "time": "12:30-13:30",
            "subject": "AAI (SO)",
            "room": "B75",
            "teacher": "SO"
          },
          {
            "time": "13:30-14:30",
            "subject": "Break",
            "room": null,
            "teacher": null
          },
          {
            "time": "14:30-15:30",
            "subject": "ILOC Practical - AIDS",
            "room": "B51",
            "teacher": "EM/AMUDHA",
            "note": "AIDS branch practical session"
          }
        ],
        "Wednesday": [
          {
            "time": "08:30-09:30",
            "subject": "BE Minor Block - AIML",
            "room": "414",
            "teacher": "Dhanamma",
            "note": "AI/ML minor subject for AIDS branch"
          },
          {
            "time": "09:30-10:30",
            "subject": "RL (POV)",
            "room": "210",
            "teacher": "POV"
          },
          {
            "time": "10:30-11:30",
            "subject": "AAI/B/SO + PROJECT/C",
            "room": "211",
            "teacher": "SO"
          },
          {
            "time": "11:30-12:30",
            "subject": "RS",
            "room": "B76",
            "teacher": "HJ"
          },
          {
            "time": "12:30-13:30",
            "subject": "Break",
            "room": null,
            "teacher": null
          },
          {
            "time": "14:30-15:30",
            "subject": "RS/A13",
            "room": "207",
            "teacher": "HJ"
          }
        ],
        "Thursday": [
          {
            "time": "08:30-09:30",
            "subject": "No Lecture",
            "room": null,
            "teacher": null
          },
          {
            "time": "09:30-10:30",
            "subject": "No Lecture",
            "room": null,
            "teacher": null
          },
          {
            "time": "10:30-11:30",
            "subject": "No Lecture",
            "room": null,
            "teacher": null
          },
          {
            "time": "11:30-12:30",
            "subject": "No Lecture",
            "room": null,
            "teacher": null
          },
          {
            "time": "12:30-13:30",
            "subject": "No Lecture",
            "room": null,
            "teacher": null
          },
          {
            "time": "13:30-14:30",
            "subject": "Break",
            "room": null,
            "teacher": null
          },
          {
            "time": "14:30-15:30",
            "subject": "No Lecture",
            "room": null,
            "teacher": null
          }
        ],
        "Friday": [
          {
            "time": "08:30-09:30",
            "subject": "Project Session",
            "room": null,
            "teacher": null,
            "note": "AIDS branch project work"
          },
          {
            "time": "09:30-10:30",
            "subject": "RL (POV)",
            "room": "B75",
            "teacher": "POV"
          },
          {
            "time": "10:30-11:30",
            "subject": "AAI (SO)",
            "room": "B75",
            "teacher": "SO"
          },
          {
            "time": "11:30-12:30",
            "subject": "RL/A/POV",
            "room": "207",
            "teacher": "POV"
          },
          {
            "time": "12:30-13:30",
            "subject": "Break",
            "room": null,
            "teacher": null
          },
          {
            "time": "14:30-15:30",
            "subject": "BE Minor Block - AIML",
            "room": "415",
            "teacher": "Dhanamma",
            "note": "AI/ML minor subject for AIDS branch"
          }
        ],
        "Saturday": [
          {
            "time": "Online",
            "subject": "Mini Project + Major Project Work",
            "room": "Online",
            "teacher": null,
            "note": "AIDS branch project work - online session"
          }
        ]
      }
    };

    const results = [];
    const queryLower = query.toLowerCase();
    
    // Check if query is about schedule/timetable
    if (queryLower.includes('class') || queryLower.includes('schedule') || queryLower.includes('timetable') || 
        queryLower.includes('monday') || queryLower.includes('tuesday') || queryLower.includes('wednesday') ||
        queryLower.includes('thursday') || queryLower.includes('friday') || queryLower.includes('saturday')) {
      
      // Extract day and time from query
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const foundDay = days.find(day => queryLower.includes(day));
      
      // Extract time pattern (like 10:30 or 930)
      const timeMatch = query.match(/(\d{1,2}):?(\d{2})/);
      let queryTime = null;
      if (timeMatch) {
        const hour = timeMatch[1].padStart(2, '0');
        const minute = timeMatch[2];
        queryTime = `${hour}:${minute}`;
      }
      
      if (foundDay && queryTime) {
        // Search for specific day and time
        const dayName = foundDay.charAt(0).toUpperCase() + foundDay.slice(1);
        const daySchedule = timetableData.timetable[dayName];
        
        if (daySchedule) {
          const classAtTime = daySchedule.find(cls => cls.time.includes(queryTime));
          if (classAtTime) {
            const teacherInfo = classAtTime.teacher ? ` with ${classAtTime.teacher}` : '';
            const roomInfo = classAtTime.room ? ` in room ${classAtTime.room}` : '';
            const noteInfo = classAtTime.note ? `. Note: ${classAtTime.note}` : '';
            
            results.push({
              content: `On ${foundDay} at ${queryTime}, you have ${classAtTime.subject}${roomInfo}${teacherInfo}${noteInfo}`,
              section: 'Timetable',
              type: 'schedule',
              score: 10,
              metadata: { day: foundDay, time: queryTime, class: classAtTime }
            });
          } else {
            // Show available classes for that day
            const dayClasses = daySchedule.map(cls => `${cls.time}: ${cls.subject}`).join(', ');
            results.push({
              content: `No class found on ${foundDay} at ${queryTime}. Available classes on ${foundDay}: ${dayClasses}`,
              section: 'Timetable',
              type: 'schedule',
              score: 8,
              metadata: { day: foundDay, time: queryTime, available: daySchedule }
            });
          }
        }
      } else if (foundDay) {
        // Search for specific day
        const dayName = foundDay.charAt(0).toUpperCase() + foundDay.slice(1);
        const daySchedule = timetableData.timetable[dayName];
        
        if (daySchedule) {
          const scheduleText = daySchedule.map(cls => {
            const teacherInfo = cls.teacher ? ` (${cls.teacher})` : '';
            const roomInfo = cls.room ? ` - Room: ${cls.room}` : '';
            return `${cls.time}: ${cls.subject}${teacherInfo}${roomInfo}`;
          }).join('\n');
          
          results.push({
            content: `Here's your schedule for ${foundDay}:\n${scheduleText}`,
            section: 'Timetable',
            type: 'schedule',
            score: 9,
            metadata: { day: foundDay, schedule: daySchedule }
          });
        }
      } else {
        // General timetable query
        let fullSchedule = '';
        for (const [day, classes] of Object.entries(timetableData.timetable)) {
          fullSchedule += `\n${day}:\n`;
          classes.forEach(cls => {
            const teacherInfo = cls.teacher ? ` (${cls.teacher})` : '';
            const roomInfo = cls.room ? ` - Room: ${cls.room}` : '';
            fullSchedule += `  ${cls.time}: ${cls.subject}${teacherInfo}${roomInfo}\n`;
          });
        }
        
        results.push({
          content: `Here's your complete timetable:${fullSchedule}`,
          section: 'Timetable',
          type: 'schedule',
          score: 7,
          metadata: { fullTimetable: timetableData.timetable }
        });
      }
    }
    
    return results;
  }

  // Search using vector database for non-timetable content
  async searchVectorDatabase(query, limit = 5) {
    try {
      console.log(`🔍 Searching vector database for: "${query}"`);
      
      // Use the vector database search function
      const results = await vectorSearch(query, limit);
      
      // Transform results to match expected format
      const transformedResults = results.map(result => ({
        content: result.payload.content,
        section: result.payload.section_title || result.payload.section || 'Unknown',
        type: result.payload.type || 'general',
        technologies: result.payload.technologies || [],
        score: result.score,
        metadata: result.payload
      }));
      
      console.log(`📋 Vector search found ${transformedResults.length} results`);
      return transformedResults;
      
    } catch (error) {
      console.error('❌ Vector database search error:', error);
      // Fallback to empty results if vector search fails
      return [];
    }
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

      const systemPrompt = `You are Kunal Patil's AI assistant. You have access to detailed information about Kunal's background, projects, skills, experience, and class schedule.

Your role is to:
- Answer questions about Kunal's professional background, projects, and skills
- Provide specific details about his work experience and achievements
- Help with class schedule and timetable queries
- Provide accurate information about class timings, subjects, teachers, and room numbers
- Be conversational, helpful, and professional
- Always base your answers on the provided context information

Context Information:
${contextText}

Guidelines:
- For timetable/schedule questions, provide specific and accurate information from the context
- If asking about a specific day and time, give the exact class details
- If the question is about Kunal's work, projects, or background, use the context to provide detailed answers
- If you don't have specific information in the context, say so politely
- Keep responses concise but informative
- Use a friendly, professional tone
- For schedule queries, format the response clearly with subject, time, room, and teacher information`;

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

  // Main chat method that prioritizes timetable for schedule queries, vector DB for others
  async chat(userQuery) {
    try {
      console.log(`💬 Processing query: "${userQuery}"`);
      
      const queryLower = userQuery.toLowerCase();
      let allResults = [];
      
      // Check if this is a timetable/schedule query
      const isScheduleQuery = queryLower.includes('class') || queryLower.includes('schedule') || 
                             queryLower.includes('timetable') || queryLower.includes('monday') || 
                             queryLower.includes('tuesday') || queryLower.includes('wednesday') ||
                             queryLower.includes('thursday') || queryLower.includes('friday') || 
                             queryLower.includes('saturday') || queryLower.match(/\d{1,2}:?\d{2}/);
      
      if (isScheduleQuery) {
        // Use direct timetable search for schedule queries
        console.log('📅 Using direct timetable search for schedule query');
        const timetableResults = this.searchTimetable(userQuery);
        allResults = [...timetableResults];
        
        // Also search vector database for additional context if needed
        if (timetableResults.length === 0) {
          const vectorResults = await this.searchVectorDatabase(userQuery, 3);
          allResults = [...allResults, ...vectorResults];
        }
      } else {
        // Use vector database for non-schedule queries
        console.log('🔍 Using vector database search for general query');
        const vectorResults = await this.searchVectorDatabase(userQuery, 5);
        allResults = [...vectorResults];
        
        // Search knowledge base (Azure Blob) for additional context if available
        const kbResults = await this.searchKnowledgeBase(userQuery, 3);
        allResults = [...allResults, ...kbResults];
      }
      
      console.log(`📊 Total context sources found: ${allResults.length}`);
      
      // Generate response with context
      const result = await this.generateResponse(userQuery, allResults);
      
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