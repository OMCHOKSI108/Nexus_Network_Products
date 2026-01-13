import React, { useState, useEffect, useRef } from 'react';
import chatbotService from '../services/chatbotService';
import cartService from '../services/cartService';

const ChatBot = ({ isAuthenticated, onLoginRequired, onNavigate, onCartUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [products, setProducts] = useState([]);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Markdown rendering function
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Split into lines for better processing
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let listItems = [];
    
    lines.forEach((line, index) => {
      // Check for numbered list
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(`<li style="margin: 0.25rem 0;">${processInlineMarkdown(numberedMatch[2])}</li>`);
      } 
      // Check for bullet list
      else if (line.match(/^[\-•]\s+(.+)$/)) {
        const bulletMatch = line.match(/^[\-•]\s+(.+)$/);
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(`<li style="margin: 0.25rem 0;">${processInlineMarkdown(bulletMatch[1])}</li>`);
      }
      // Regular line
      else {
        // Close list if we were in one
        if (inList && listItems.length > 0) {
          html += '<ol style="margin: 0.5rem 0; padding-left: 1.5rem; list-style-type: decimal;">' + listItems.join('') + '</ol>';
          listItems = [];
          inList = false;
        }
        
        // Process regular line
        if (line.trim()) {
          html += processInlineMarkdown(line) + '<br />';
        } else if (index < lines.length - 1) {
          html += '<br />';
        }
      }
    });
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      html += '<ol style="margin: 0.5rem 0; padding-left: 1.5rem; list-style-type: decimal;">' + listItems.join('') + '</ol>';
    }
    
    return html;
  };
  
  // Process inline markdown (bold, italic)
  const processInlineMarkdown = (text) => {
    return text
      // Bold: **text** or __text__
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
      .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');
  };

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

  // Reset session when authentication changes
  useEffect(() => {
    // Generate new session ID when user logs in or logs out
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatbot_session_id', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setProducts([]);
    setSuggestedActions([]);
    console.log('[CHATBOT] Session reset due to auth change. New session:', newSessionId);
  }, [isAuthenticated]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, products]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async (sid) => {
    try {
      const result = await chatbotService.getConversation(sid);
      if (result.success && result.conversation) {
        const filteredMessages = result.conversation.messages.filter(
          m => m.role !== 'system'
        );
        setMessages(filteredMessages);
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
    setProductQuantities({});

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
            setTimeout(() => {
              const confirmLogin = window.confirm(
                'Login Required\n\nTo add items to cart and place orders, please login.\n\nWould you like to login now?'
              );
              if (confirmLogin) {
                onLoginRequired();
              }
            }, 500);
          }
        }

        // Set products if available with initial quantities
        if (result.products && result.products.length > 0) {
          setProducts(result.products);
          const initialQty = {};
          result.products.forEach(p => {
            initialQty[p._id] = 1;
          });
          setProductQuantities(initialQty);
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

  // Handle quantity change for products
  const handleQuantityChange = (productId, change) => {
    setProductQuantities(prev => {
      const product = products.find(p => p._id === productId);
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, Math.min((product?.maxQuantity || 10), currentQty + change));
      return { ...prev, [productId]: newQty };
    });
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        const confirmLogin = window.confirm(
          `Login to Add "${product.name}"\n\nPlease login to add items to your cart.\n\nWould you like to login now?`
        );
        if (confirmLogin) {
          onLoginRequired();
        }
      }
      return;
    }

    const quantity = productQuantities[product._id] || 1;
    setAddingToCart(prev => ({ ...prev, [product._id]: true }));

    try {
      const result = await chatbotService.addToCart(product._id, quantity, sessionId);
      
      if (result.success) {
        // Show success message
        const successMsg = {
          role: 'assistant',
          content: `Added ${quantity}x "${product.name}" to your cart successfully.`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMsg]);

        // Update cart count if callback provided
        if (onCartUpdate) {
          onCartUpdate();
        }

        // Reset quantity for this product
        setProductQuantities(prev => ({ ...prev, [product._id]: 1 }));
      } else {
        throw new Error(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMsg = {
        role: 'assistant',
        content: `Sorry, couldn't add "${product.name}" to cart. ${error.message || 'Please try again.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  // Handle buy now
  const handleBuyNow = async (product) => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        const confirmLogin = window.confirm(
          `Login to Purchase "${product.name}"\n\nPlease login to purchase items.\n\nWould you like to login now?`
        );
        if (confirmLogin) {
          onLoginRequired();
        }
      }
      return;
    }

    const quantity = productQuantities[product._id] || 1;
    setAddingToCart(prev => ({ ...prev, [`buy_${product._id}`]: true }));

    try {
      // Add to cart first
      await cartService.addToCart(product._id, quantity);
      
      // Navigate to checkout
      if (onNavigate) {
        setIsOpen(false);
        onNavigate('/checkout');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      const errorMsg = {
        role: 'assistant',
        content: `Sorry, couldn't process purchase for "${product.name}". Please try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setAddingToCart(prev => ({ ...prev, [`buy_${product._id}`]: false }));
    }
  };

  const handleActionClick = async (action) => {
    switch (action.type) {
      case 'view_cart':
        if (onNavigate) {
          setIsOpen(false);
          onNavigate('/cart');
        }
        break;
      case 'checkout':
        if (onNavigate) {
          setIsOpen(false);
          onNavigate('/checkout');
        }
        break;
      case 'continue_shopping':
        if (onNavigate) {
          setIsOpen(false);
          onNavigate('/products');
        }
        break;
      case 'login':
        if (onLoginRequired) {
          onLoginRequired();
        }
        break;
      case 'track_order':
        if (onNavigate) {
          setIsOpen(false);
          onNavigate('/my-orders');
        }
        break;
      default:
        console.log('Unknown action:', action.type);
    }
  };

  const handleProductClick = (productId) => {
    if (onNavigate) {
      setIsOpen(false);
      onNavigate(`/product/${productId}`);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear this conversation?\n\nThis will start a fresh chat session.')) {
      setMessages([]);
      setProducts([]);
      setSuggestedActions([]);
      setProductQuantities({});
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  };

  const quickActions = [
    { label: 'Search Products', message: 'Show me available products' },
    { label: 'Under Rs. 500', message: 'Show brass products under Rs. 500' },
    { label: 'Best Sellers', message: 'What are your best-selling products?' },
    { label: 'Categories', message: 'What categories do you have?' },
    ...(isAuthenticated ? [
      { label: 'My Cart', message: 'Show my cart' },
      { label: 'My Orders', message: 'Show my recent orders' }
    ] : [
      { label: 'Login Benefits', message: 'What are the benefits of creating an account?' }
    ])
  ];

  const handleQuickAction = (message) => {
    setInputMessage(message);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <>
      {/* Chat Button - Positioned at bottom */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
        style={{ backgroundColor: '#1f2937', width: '60px', height: '60px' }}
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messages.filter(m => m.role === 'assistant').length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[650px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-300 overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="text-white p-4 flex items-center justify-between" style={{ backgroundColor: '#1f2937' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C39A2E' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Nexus Assistant</h3>
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C39A2E' }}></span>
                  {isAuthenticated ? 'Logged In' : 'Guest Mode'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClearChat}
              className="text-gray-300 hover:text-white rounded-lg p-2 transition-all"
              style={{ hover: { backgroundColor: 'rgba(195, 154, 46, 0.2)' } }}
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
              <div className="text-center py-6 px-4">
                <div className="text-5xl mb-4">💬</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Welcome to Nexus Assistant</h4>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {isAuthenticated 
                    ? "I'm here to help you find products, manage orders, and answer your questions." 
                    : "Browse products, get recommendations, and more. Login to unlock full features."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.message)}
                      className="text-xs bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-100 hover:border-gray-400 transition-all"
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
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#1f2937' } : {}}
                >
                  <div 
                    className="text-sm leading-relaxed chatbot-message"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Product Cards */}
            {products.length > 0 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Found {products.length} Product{products.length > 1 ? 's' : ''}
                  </p>
                </div>
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Product Image - Full Width */}
                    {product.image && (
                      <div className="relative overflow-hidden bg-gray-100" style={{ height: '180px' }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                          onClick={() => handleProductClick(product._id)}
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                        {/* Stock Badge Overlay */}
                        <div className="absolute top-2 right-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-md ${
                            product.inStock 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {product.inStock ? `${product.stockQuantity} in stock` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Product Info */}
                    <div 
                      onClick={() => handleProductClick(product._id)}
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <h5 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h5>
                      
                      {product.category && (
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {product.category}
                        </p>
                      )}

                      {product.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xl font-bold" style={{ color: '#C39A2E' }}>
                          ₹{product.price.toLocaleString()}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product._id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          View Details
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Actions */}
                    {product.canAddToCart && isAuthenticated && (
                      <div className="bg-gray-50 px-3 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                            <button
                              onClick={() => handleQuantityChange(product._id, -1)}
                              className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={productQuantities[product._id] <= 1}
                            >
                              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                              </svg>
                            </button>
                            <div className="px-4 py-2 font-bold text-sm min-w-[50px] text-center border-x-2 border-gray-300 bg-gray-50">
                              {productQuantities[product._id] || 1}
                            </div>
                            <button
                              onClick={() => handleQuantityChange(product._id, 1)}
                              className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={productQuantities[product._id] >= product.maxQuantity}
                            >
                              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={addingToCart[product._id]}
                            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {addingToCart[product._id] ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>

                        {/* Buy Now Button - Full Width */}
                        <button
                          onClick={() => handleBuyNow(product)}
                          disabled={addingToCart[`buy_${product._id}`]}
                          className="w-full text-white text-xs font-bold px-3 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          style={{ backgroundColor: '#C39A2E' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#B88622'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#C39A2E'}
                        >
                          {addingToCart[`buy_${product._id}`] ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Buy Now - Instant Checkout
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Guest mode CTA */}
                    {!isAuthenticated && (
                      <div className="bg-gray-100 px-3 py-2 border-t border-gray-300">
                        <button
                          onClick={onLoginRequired}
                          className="w-full text-white text-xs font-bold px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                          style={{ backgroundColor: '#1f2937' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#1f2937'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Login to Purchase
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Actions */}
            {suggestedActions.length > 0 && (
              <div className="space-y-2 animate-fadeIn">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action)}
                      className="text-white text-xs font-semibold px-4 py-2 rounded-full transition-all"
                      style={{ backgroundColor: '#C39A2E' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#B88622'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#C39A2E'}
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
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isAuthenticated ? "Ask me anything..." : "Ask about products..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none text-sm transition-all"
                style={{ 
                  ':focus': {
                    boxShadow: '0 0 0 4px rgba(195, 154, 46, 0.12)',
                    borderColor: '#C39A2E'
                  }
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ width: '48px', height: '48px' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by AI - {isAuthenticated ? 'Logged In' : 'Guest Mode'}
            </p>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Markdown styling */
        .chatbot-message strong {
          font-weight: 700;
          color: #C39A2E;
        }
        
        .chatbot-message em {
          font-style: italic;
          color: #6b7280;
        }
        
        .chatbot-message ul, .chatbot-message ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        .chatbot-message li {
          margin: 0.25rem 0;
        }
        
        /* Input focus styling with brass */
        input:focus {
          box-shadow: 0 0 0 4px rgba(195, 154, 46, 0.12) !important;
          border-color: #C39A2E !important;
        }
      `}</style>
    </>
  );
};

export default ChatBot;
