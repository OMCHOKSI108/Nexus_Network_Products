const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const groqService = require('../services/groqService');
const ragService = require('../services/ragService');
const authenticateToken = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Middleware to optionally authenticate - allows both guest and authenticated users
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we allow the request to continue as guest
      req.user = null;
    }
  }
  
  next();
};

// System prompt for the chatbot
const getSystemPrompt = (isAuthenticated, websiteInfo) => {
  return `You are a helpful AI assistant for ${websiteInfo.name}, a ${websiteInfo.description}.

CRITICAL: User authentication status is ${isAuthenticated ? 'AUTHENTICATED (LOGGED IN)' : 'NOT AUTHENTICATED (GUEST)'}.

Your role:
- Help users find products, answer questions about products and services
- Provide accurate information based on the context provided
- Be friendly, professional, and concise
- Always use the provided product data - never make up product details
${isAuthenticated ? `- The user is LOGGED IN and can add items to cart, place orders, and checkout
- Provide direct "Add to Cart" instructions with product IDs
- Guide users through checkout process when needed
- Provide order tracking information` : `- Inform users they need to log in for cart management and orders
- Encourage users to create an account for better experience`}

Important Guidelines:
1. NEVER invent product names, prices, or specifications
2. Only mention products that are provided in the context
3. If you don't have information, say so and offer to help differently
4. Always mention if a product is out of stock
5. ${isAuthenticated ? 'User IS authenticated - they CAN add to cart and checkout' : 'User is NOT authenticated - they CANNOT add to cart yet'}
6. Use rupees (₹) for all prices
7. Be concise but helpful

When suggesting products:
- Provide the product ID so users can easily view details
- Mention price, availability, and key features
- Offer alternatives if something is unavailable

${isAuthenticated ? `When user wants to perform actions (add to cart, checkout):
- The user is LOGGED IN and ready to make purchases
- Tell them to click "Add to Cart" button on the product
- Confirm their cart operations
- Guide them to checkout when ready` : `When user wants to add items or checkout:
- Clearly inform them they need to log in first
- Provide a login prompt`}
- Provide clear, actionable buttons/links
- Confirm successful actions
- Handle errors gracefully` : ''}`;
};

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot
 * Works for both guest and authenticated users
 */
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, sessionId: providedSessionId } = req.body;
    const userId = req.user?._id || null;
    const isAuthenticated = !!userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Generate or use provided session ID
    const sessionId = providedSessionId || uuidv4();

    // Find or create conversation
    let conversation = await Conversation.findOne({
      sessionId,
      status: 'active'
    });

    if (!conversation) {
      conversation = new Conversation({
        userId,
        sessionId,
        messages: [],
        context: {
          isAuthenticated
        }
      });
    } else {
      // Always update authentication status to reflect current state
      if (userId) {
        conversation.userId = userId;
        conversation.context.isAuthenticated = true;
      } else {
        conversation.context.isAuthenticated = false;
      }
    }

    // Add user message
    await conversation.addMessage('user', message);

    // Get relevant context using RAG
    const ragContext = await ragService.getRelevantContext(
      message,
      userId,
      { limit: 5, orderLimit: 3 }
    );

    // Extract potential actions
    const actions = ragService.extractActions(message);

    // Check if user is trying to perform authenticated action without login
    const requiresAuth = actions.some(a => a.requires_auth);
    if (requiresAuth && !isAuthenticated) {
      const authResponse = "I'd love to help you with that! However, you need to be logged in to manage your cart and place orders. Please log in or create an account to continue.";
      
      await conversation.addMessage('assistant', authResponse, {
        requiresAuth: true,
        suggestedAction: 'login'
      });

      await conversation.save();

      return res.status(200).json({
        success: true,
        response: authResponse,
        sessionId,
        requiresAuth: true,
        suggestedAction: 'login',
        conversationId: conversation._id
      });
    }

    // Format context for LLM
    const contextText = ragService.formatContextForPrompt(ragContext);

    // Build messages for LLM
    const recentMessages = conversation.getRecentMessages(8);
    const llmMessages = [
      {
        role: 'system',
        content: getSystemPrompt(isAuthenticated, ragContext.websiteInfo)
      },
      {
        role: 'system',
        content: `Current Context:\n${contextText}`
      },
      ...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Get response from Groq
    const groqResponse = await groqService.chat(llmMessages, {
      temperature: 0.7,
      max_tokens: 1024
    });

    if (!groqResponse.success) {
      // Fallback response
      const fallbackResponse = "I'm having trouble processing your request right now. Please try again in a moment.";
      await conversation.addMessage('assistant', fallbackResponse, { error: true });
      await conversation.save();

      return res.status(200).json({
        success: true,
        response: fallbackResponse,
        sessionId,
        conversationId: conversation._id,
        error: 'AI service unavailable'
      });
    }

    const assistantResponse = groqResponse.content;

    // Save assistant response
    await conversation.addMessage('assistant', assistantResponse, {
      usage: groqResponse.usage,
      actions
    });

    // Track relevant products mentioned
    if (ragContext.products.length > 0) {
      conversation.context.relevantProducts = ragContext.products.map(p => p._id);
    }

    await conversation.save();

    // Prepare response
    const response = {
      success: true,
      response: assistantResponse,
      sessionId,
      conversationId: conversation._id,
      isAuthenticated,
      context: {
        hasProducts: ragContext.products.length > 0,
        hasCart: !!ragContext.cart,
        hasOrders: ragContext.orders.length > 0
      }
    };

    // Include products in response for frontend to display
    if (ragContext.products.length > 0) {
      response.products = ragContext.products;
    }

    // Include suggested actions
    if (actions.length > 0) {
      response.suggestedActions = actions;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Chatbot message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing message',
      error: error.message
    });
  }
});

/**
 * GET /api/chatbot/conversation/:sessionId
 * Get conversation history
 */
router.get('/conversation/:sessionId', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?._id || null;

    const query = { sessionId, status: 'active' };
    
    // If authenticated, also match userId for security
    if (userId) {
      query.$or = [
        { userId },
        { userId: null } // Also include conversations started as guest
      ];
    }

    const conversation = await Conversation.findOne(query)
      .select('messages context createdAt updatedAt');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      conversation: {
        id: conversation._id,
        messages: conversation.messages,
        context: conversation.context,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversation'
    });
  }
});

/**
 * GET /api/chatbot/conversations
 * Get all conversations for authenticated user
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await Conversation.find({
      userId,
      status: 'active'
    })
      .sort({ 'context.lastActivity': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('sessionId messages context createdAt updatedAt');

    const total = await Conversation.countDocuments({
      userId,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv._id,
        sessionId: conv.sessionId,
        lastMessage: conv.messages[conv.messages.length - 1]?.content || '',
        messageCount: conv.messages.length,
        lastActivity: conv.context.lastActivity,
        createdAt: conv.createdAt
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversations'
    });
  }
});

/**
 * DELETE /api/chatbot/conversation/:sessionId
 * End/archive a conversation
 */
router.delete('/conversation/:sessionId', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?._id || null;

    const query = { sessionId };
    if (userId) {
      query.userId = userId;
    }

    const conversation = await Conversation.findOneAndUpdate(
      query,
      { status: 'ended' },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation ended successfully'
    });

  } catch (error) {
    console.error('❌ Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending conversation'
    });
  }
});

/**
 * POST /api/chatbot/feedback
 * Submit feedback on a chatbot response
 */
router.post('/feedback', optionalAuth, async (req, res) => {
  try {
    const { sessionId, messageIndex, rating, feedback } = req.body;

    const conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (messageIndex < 0 || messageIndex >= conversation.messages.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message index'
      });
    }

    // Add feedback to message metadata
    conversation.messages[messageIndex].metadata = {
      ...conversation.messages[messageIndex].metadata,
      feedback: {
        rating,
        comment: feedback,
        timestamp: new Date()
      }
    };

    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('❌ Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
});

module.exports = router;
