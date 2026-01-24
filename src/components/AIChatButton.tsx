import React, { useState } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  sources?: Array<{
    section: string;
    type: string;
    technologies: string[];
  }>;
}

interface ChatResponse {
  success: boolean;
  message: string;
  contextUsed?: boolean;
  sources?: Array<{
    section: string;
    type: string;
    technologies: string[];
  }>;
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
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      });

      const data: ChatResponse = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.success ? data.message : (data.error || 'Sorry, I encountered an error. Please try again.'),
        timestamp: data.timestamp,
        sources: data.sources
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

  return (
    <>
      {/* Chat Button - Artistic Design */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 group ${
          isOpen ? 'hidden' : 'flex'
        } items-center gap-3 bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border border-gray-800 dark:border-gray-200`}
        aria-label="Ask about Kunal"
      >
        <div className="relative">
          <Bot className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-black rounded-full animate-pulse">
            <div className="w-full h-full bg-black dark:bg-white rounded-full animate-ping"></div>
          </div>
        </div>
        <span className="hidden sm:block font-medium tracking-wide">Ask about me</span>
        <Sparkles className="w-4 h-4 opacity-60 animate-pulse" />
      </button>

      {/* Chat Modal - Minimalist Artistic Design */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/10 dark:bg-white/10 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Window */}
          <div className="relative bg-white dark:bg-black rounded-3xl shadow-2xl w-full max-w-md h-[600px] max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-900 bg-gradient-to-r from-gray-50 to-white dark:from-gray-950 dark:to-black">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-black"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white tracking-tight">Kunal's AI Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Ask me anything</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-950/50 dark:to-black">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white dark:text-black" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-black dark:bg-white text-white dark:text-black ml-auto'
                          : 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-light">{message.content}</p>
                    </div>
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p className="font-medium opacity-70">Sources:</p>
                        <div className="space-y-1 pl-2 border-l border-gray-200 dark:border-gray-800">
                          {message.sources.map((source, index) => (
                            <div key={index} className="flex items-center gap-2 opacity-60">
                              <div className="w-1 h-1 bg-black dark:bg-white rounded-full"></div>
                              <span className="font-light">{source.section}</span>
                              {source.technologies.length > 0 && (
                                <span className="text-gray-400 dark:text-gray-600 text-xs">
                                  ({source.technologies.slice(0, 2).join(', ')})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 font-light opacity-50">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white dark:text-black" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-light">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-black">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about Kunal's projects, skills, experience..."
                  className="flex-1 p-4 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-950 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 font-light"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-3 text-center font-light opacity-60">
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