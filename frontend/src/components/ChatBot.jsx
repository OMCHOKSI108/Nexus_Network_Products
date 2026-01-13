import React, { useState, useEffect, useRef } from 'react';
import chatbotService from '../services/chatbotService';

const ChatBot = ({ isAuthenticated, onLoginRequired, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [products, setProducts] = useState([]);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem('chatbot_session_id');
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);

    // Load previous conversation
    loadConversation(storedSessionId);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async (sid) => {
    try {
      const result = await chatbotService.getConversation(sid);
      if (result.success && result.conversation) {
        setMessages(result.conversation.messages.filter(m => m.role !== 'system'));
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to UI
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setProducts([]);
    setSuggestedActions([]);

    try {
      const result = await chatbotService.sendMessage(userMessage, sessionId);

      if (result.success) {
        // Add assistant message
        const assistantMessage = {
          role: 'assistant',
          content: result.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Handle authentication required
        if (result.requiresAuth && !isAuthenticated) {
          if (onLoginRequired) {
            setTimeout(() => onLoginRequired(), 1000);
          }
        }

        // Set products if available
        if (result.products && result.products.length > 0) {
          setProducts(result.products);
        }

        // Set suggested actions
        if (result.suggestedActions && result.suggestedActions.length > 0) {
          setSuggestedActions(result.suggestedActions);
        }
      } else {
        // Error response
        const errorMessage = {
          role: 'assistant',
          content: result.message || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (action) => {
    switch (action.type) {
      case 'view_cart':
        if (onNavigate) onNavigate('/cart');
        break;
      case 'checkout':
        if (onNavigate) onNavigate('/checkout');
        break;
      case 'continue_shopping':
        if (onNavigate) onNavigate('/products');
        setIsOpen(false);
        break;
      case 'login':
        if (onLoginRequired) onLoginRequired();
        break;
      case 'add_to_cart':
        // Handle add to cart
        break;
      case 'track_order':
        if (onNavigate) onNavigate('/my-orders');
        break;
      default:
        console.log('Unknown action:', action.type);
    }
  };

  const handleProductClick = (productId) => {
    if (onNavigate) {
      onNavigate(`/product/${productId}`);
      setIsOpen(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear this conversation?')) {
      setMessages([]);
      setProducts([]);
      setSuggestedActions([]);
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  };

  const quickActions = [
    { label: '🔍 Search Products', message: 'Show me available products' },
    { label: '📦 Categories', message: 'What categories do you have?' },
    { label: '❓ Help', message: 'How can I use this website?' },
    ...(isAuthenticated ? [
      { label: '🛒 My Cart', message: 'Show my cart' },
      { label: '📋 My Orders', message: 'Show my recent orders' }
    ] : [])
  ];

  const handleQuickAction = (message) => {
    setInputMessage(message);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 flex items-center justify-center"
        style={{ width: '60px', height: '60px' }}
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Nexus Assistant</h3>
                <p className="text-xs text-blue-100">
                  {isAuthenticated ? 'Ready to help!' : 'Ask me anything'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClearChat}
              className="text-white hover:text-blue-200 transition-colors"
              title="Clear chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👋</div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Nexus Assistant!</h4>
                <p className="text-sm text-gray-600 mb-4">
                  I can help you find products, answer questions, and {isAuthenticated ? 'manage your orders' : 'guide you through our services'}.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.message)}
                      className="text-xs bg-white border border-gray-300 rounded-lg p-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Display */}
            {products.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">Suggested Products</p>
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex space-x-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm text-gray-800 truncate">{product.name}</h5>
                        <p className="text-xs text-gray-600 mt-1">₹{product.price}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.inStock ? (
                            <span className="text-green-600">✓ In Stock ({product.stockQuantity})</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Actions */}
            {suggestedActions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action)}
                      className="bg-blue-600 text-white text-xs px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ width: '40px', height: '40px' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
