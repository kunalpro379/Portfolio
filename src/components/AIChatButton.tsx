import React, { useState } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import GeminiIcon from './icons/GeminiIcon';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface ChatResponse {
  success: boolean;
  message: string;
  contextUsed?: boolean;
  timestamp: string;
  error?: string;
}

const AIChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm Kunal's AI assistant. I can help you learn about his background, projects, skills, and experience. What would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use the correct API base URL from config
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AI_CHAT}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      });

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data: ChatResponse = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.success ? data.message : (data.error || 'Sorry, I encountered an error. Please try again.'),
        timestamp: data.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format AI message content for better display
  const formatMessageContent = (content: string) => {
    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Handle bullet points
      if (paragraph.includes('•') || paragraph.includes('-')) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-3">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-2 mb-1">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{trimmedLine.replace(/^[•-]\s*/, '')}</span>
                  </div>
                );
              }
              return <div key={lineIndex} className="mb-1">{trimmedLine}</div>;
            })}
          </div>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(paragraph.trim())) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-3">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (/^\d+\./.test(trimmedLine)) {
                const [number, ...rest] = trimmedLine.split('.');
                return (
                  <div key={lineIndex} className="flex items-start gap-2 mb-1">
                    <span className="text-purple-500 font-semibold">{number}.</span>
                    <span>{rest.join('.').trim()}</span>
                  </div>
                );
              }
              return <div key={lineIndex} className="mb-1 ml-4">{trimmedLine}</div>;
            })}
          </div>
        );
      }
      
      // Regular paragraphs
      return (
        <div key={index} className="mb-3">
          {paragraph}
        </div>
      );
    });
  };

  return (
    <>
      {/* Chat Button - Enhanced with Gemini Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 group ${
          isOpen ? 'hidden' : 'flex'
        } items-center gap-3 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-2 border-white/20 backdrop-blur-sm`}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
        }}
        aria-label="Ask about Kunal"
      >
        <div className="relative">
          <GeminiIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" size={24} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/90 rounded-full animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
          </div>
        </div>
        <span className="hidden sm:block font-semibold tracking-wide text-white drop-shadow-sm">Ask about me</span>
        <Sparkles className="w-4 h-4 opacity-80 animate-pulse text-yellow-300" />
      </button>

      {/* Chat Modal - Minimalist Artistic Design */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/10 dark:bg-white/10 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Window - Enhanced Design */}
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md h-[600px] max-h-[80vh] flex flex-col border-2 border-white/20 dark:border-gray-700/30 overflow-hidden"
            style={{
              boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
            }}
          >
            {/* Header - Enhanced */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <GeminiIcon className="w-6 h-6 text-white" size={24} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">Kunal's AI Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ask me anything</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Messages - Enhanced Styling */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/30 to-white/30 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <GeminiIcon className="w-4 h-4 text-white" size={16} />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`p-4 rounded-2xl shadow-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto shadow-lg'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm'
                      }`}
                      style={message.type === 'user' ? {
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                      } : {}}
                    >
                      {message.type === 'ai' ? (
                        <div className="text-sm leading-relaxed font-medium">
                          {formatMessageContent(message.content)}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium opacity-60">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <User className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <GeminiIcon className="w-4 h-4 text-white" size={16} />
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Thinking...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input - Enhanced */}
            <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about Kunal's projects, skills, experience..."
                  className="flex-1 p-4 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-medium backdrop-blur-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                  style={{
                    boxShadow: '0 8px 25px rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center font-medium opacity-70 flex items-center justify-center gap-2">
                <GeminiIcon className="w-3 h-3" size={12} />
                Powered by AI • Information based on Kunal's portfolio
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatButton;