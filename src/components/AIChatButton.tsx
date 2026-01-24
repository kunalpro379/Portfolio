import React, { useState } from 'react';
import { X, Send, Loader2, User } from 'lucide-react';
import { API_CONFIG } from '../config/api';

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

  // Debug log to ensure component is rendering
  console.log('AIChatButton rendered, isOpen:', isOpen);

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
      // Construct the full URL
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AI_CHAT}/chat`;
      console.log('Making API call to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response');
      }

      const data: ChatResponse = await response.json();
      console.log('API response:', data);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    // Clean up the content by removing markdown formatting
    let cleanContent = content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/`(.*?)`/g, '$1')       // Remove inline code markdown
      .replace(/#{1,6}\s/g, '')        // Remove heading markdown
      .replace(/^\s*[-•]\s*/gm, '• ')  // Normalize bullet points
      .replace(/^\s*\d+\.\s*/gm, (_, offset, string) => {
        const lineStart = string.lastIndexOf('\n', offset) + 1;
        const lineNumber = string.substring(lineStart, offset).match(/^\s*(\d+)\./);
        return lineNumber ? `${lineNumber[1]}. ` : '• ';
      });

    // Split content into paragraphs
    const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Handle bullet points
      if (trimmedParagraph.includes('•')) {
        const lines = trimmedParagraph.split('\n');
        return (
          <div key={index} className="mb-3">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('•')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-2 mb-1">
                    <span className="text-black mt-1 font-bold">•</span>
                    <span>{trimmedLine.replace(/^•\s*/, '')}</span>
                  </div>
                );
              }
              return trimmedLine ? <div key={lineIndex} className="mb-1">{trimmedLine}</div> : null;
            })}
          </div>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(trimmedParagraph)) {
        const lines = trimmedParagraph.split('\n');
        return (
          <div key={index} className="mb-3">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (/^\d+\./.test(trimmedLine)) {
                const [numberPart, ...rest] = trimmedLine.split('.');
                return (
                  <div key={lineIndex} className="flex items-start gap-2 mb-1">
                    <span className="text-black font-bold">{numberPart}.</span>
                    <span>{rest.join('.').trim()}</span>
                  </div>
                );
              }
              return trimmedLine ? <div key={lineIndex} className="mb-1 ml-4">{trimmedLine}</div> : null;
            })}
          </div>
        );
      }
      
      // Regular paragraphs
      return (
        <div key={index} className="mb-3">
          {trimmedParagraph}
        </div>
      );
    });
  };

  return (
    <>
      {/* Chat Button - Mobile Optimized */}
      <button
        onClick={() => setIsOpen(true)}
        className={`ai-chat-button-fixed group ${
          isOpen ? 'hidden' : 'flex'
        } items-center gap-2 sm:gap-3 bg-white text-black px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-4 border-black relative overflow-hidden`}
        style={{
          borderRadius: '20px 25px 20px 25px',
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,0.1)',
        }}
        aria-label="Ask about Kunal"
      >
        {/* Animated background pattern - removed dots */}
        <div className="absolute inset-0 opacity-5">
        </div>
        
        {/* Main content */}
        <div className="relative flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center p-1">
              <img src="/gemini.png" alt="Gemini AI" className="w-full h-full object-contain animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <span className="text-sm sm:text-base font-black tracking-wide text-black relative">
            Ask about me
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </span>
        </div>
        
        {/* Hover effect lines */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        
        {/* Hover effect lines */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      </button>

      {/* Chat Modal - Mobile Optimized */}
      {isOpen && (
        <div className="fixed inset-0 flex items-end justify-center sm:justify-end p-2 sm:p-4" style={{ zIndex: 999998 }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/10 dark:bg-white/10 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Window - Mobile Responsive */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md h-[85vh] sm:h-[600px] max-h-[85vh] sm:max-h-[80vh] flex flex-col border-4 border-black overflow-hidden mx-auto sm:mx-0"
            style={{
              borderRadius: '25px 30px 25px 30px',
              boxShadow: '12px 12px 0px 0px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.1)',
            }}
          >
            {/* Header - Mobile Optimized */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b-4 border-black bg-white relative overflow-hidden">
              {/* Background pattern - removed dots */}
              <div className="absolute inset-0 opacity-5">
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 relative">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-2">
                    <img src="/gemini.png" alt="Gemini AI" className="w-full h-full object-contain animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-black rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-black tracking-tight">Kunal's AI Assistant</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Ask me anything</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110 border-2 border-transparent hover:border-black"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Messages - Mobile Optimized */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 relative">
              {/* Background pattern - removed dots */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
              </div>
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 relative ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1 relative p-1">
                      <img src="/gemini.png" alt="Gemini AI" className="w-full h-full object-contain animate-spin" style={{ animationDuration: '5s' }} />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-black rounded-full flex items-center justify-center">
                        <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`p-3 relative ${
                        message.type === 'user'
                          ? 'bg-black text-white ml-auto rounded-2xl'
                          : 'bg-white text-black border-2 border-gray-200 rounded-2xl'
                      }`}
                      style={message.type === 'user' ? {
                        borderRadius: '18px 20px 18px 20px',
                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)'
                      } : {
                        borderRadius: '20px 18px 20px 18px',
                        boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.05)'
                      }}
                    >
                      {/* Message decoration */}
                      {message.type === 'ai' && (
                        <div className="absolute top-2 right-2 w-1 h-1 bg-gray-300 rounded-full opacity-50"></div>
                      )}
                      
                      {message.type === 'ai' ? (
                        <div className="text-sm leading-relaxed">
                          {formatMessageContent(message.content)}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 relative border-2 border-gray-400">
                      <User className="w-4 h-4 text-gray-700" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-gray-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative p-1">
                    <img src="/gemini.png" alt="Gemini AI" className="w-full h-full object-contain animate-spin" style={{ animationDuration: '2s' }} />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border-2 border-gray-200 relative"
                    style={{
                      borderRadius: '20px 18px 20px 18px',
                      boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span className="text-sm text-black">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input - Mobile Optimized */}
            <div className="p-3 sm:p-4 border-t-4 border-black bg-white relative overflow-hidden">
              {/* Background pattern - removed dots */}
              <div className="absolute inset-0 opacity-5">
              </div>
              
              <div className="flex gap-2 sm:gap-3 relative">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about Kunal's projects, skills, experience..."
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    style={{
                      borderRadius: '15px 18px 15px 18px',
                    }}
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 sm:p-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{
                    borderRadius: '18px 15px 18px 15px',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)',
                  }}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center flex items-center justify-center gap-2 relative">
                <img src="/gemini.png" alt="Gemini AI" className="w-3 h-3 sm:w-5 sm:h-5 object-contain animate-spin" style={{ animationDuration: '6s' }} />
                <span>Powered by AI</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="hidden sm:inline">Information based on Kunal's portfolio</span>
                <span className="sm:hidden">Kunal's portfolio</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatButton;