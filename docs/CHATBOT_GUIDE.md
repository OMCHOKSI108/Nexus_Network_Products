# RAG Chatbot System - Nexus Network Products

## 🤖 Overview

A sophisticated RAG (Retrieval Augmented Generation) chatbot powered by GROQ AI that provides intelligent assistance for the Nexus Network Products e-commerce platform. The chatbot handles both pre-login and post-login scenarios with context-aware responses.

## ✨ Features

### Pre-Login Features (Guest Users)
- ✅ Product search and discovery
- ✅ Product information and specifications
- ✅ Category browsing
- ✅ General website information
- ✅ Price inquiries
- ✅ Stock availability checks
- ✅ Product comparisons
- ✅ Navigation assistance

### Post-Login Features (Authenticated Users)
- ✅ Cart management (add, remove, update items)
- ✅ Order placement assistance
- ✅ Order tracking and status
- ✅ Order history viewing
- ✅ Personalized product recommendations
- ✅ Profile management assistance
- ✅ Interactive checkout guidance

### Advanced Capabilities
- 🧠 Context-aware responses using RAG
- 💬 Natural conversation flow
- 🔄 Session persistence
- 📊 Product recommendations based on queries
- 🛡️ Hallucination prevention mechanisms
- 🎯 Action buttons for quick tasks
- 📱 Responsive mobile-friendly UI
- 🔐 Secure authentication handling

## 🏗️ Architecture

### Backend Components

#### 1. **Conversation Model** (`server/models/Conversation.js`)
- Stores chat history with user/assistant roles
- Tracks session IDs for guest users
- Links conversations to authenticated users
- Maintains conversation context and metadata
- Supports conversation archiving

#### 2. **GROQ Service** (`server/services/groqService.js`)
- Integration with GROQ AI API
- Chat completion with context
- Streaming support for real-time responses
- Function calling capabilities
- Error handling and fallback mechanisms

#### 3. **RAG Service** (`server/services/ragService.js`)
- Retrieves relevant context from database
- Product search and filtering
- Cart and order information retrieval
- Context formatting for LLM prompts
- Action extraction from user queries
- Query intent classification

#### 4. **Chatbot Routes** (`server/routes/chatbotRoutes.js`)
- `POST /api/chatbot/message` - Send message
- `GET /api/chatbot/conversation/:sessionId` - Get conversation
- `GET /api/chatbot/conversations` - List user conversations
- `DELETE /api/chatbot/conversation/:sessionId` - End conversation
- `POST /api/chatbot/feedback` - Submit feedback

#### 5. **Chatbot Cart Routes** (`server/routes/chatbotCartRoutes.js`)
- `POST /api/chatbot/cart/add` - Add to cart via chat
- `GET /api/chatbot/cart` - Get cart summary
- `DELETE /api/chatbot/cart/item/:productId` - Remove item
- `PUT /api/chatbot/cart/item/:productId` - Update quantity
- `DELETE /api/chatbot/cart/clear` - Clear cart

### Frontend Components

#### 1. **ChatBot Component** (`frontend/src/components/ChatBot.jsx`)
- Floating chat button (bottom-right corner)
- Expandable chat window
- Message history display
- Typing indicators
- Product cards in chat
- Action buttons (checkout, view cart, etc.)
- Quick action buttons
- Session management

#### 2. **Chatbot Service** (`frontend/src/services/chatbotService.js`)
- API communication
- Session management
- Authentication handling
- Cart operations
- Conversation management

## 🔧 Configuration

### Environment Variables

Add to `server/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### GROQ API Setup

1. Get API key from [GROQ Console](https://console.groq.com)
2. Add to `.env` file
3. Model used: `llama-3.3-70b-versatile` (fast and capable)

## 📋 Implementation Details

### RAG Pipeline

1. **User Query** → Received by frontend
2. **Session Management** → Check/create session ID
3. **Authentication Check** → Determine user status
4. **Context Retrieval** → RAG Service fetches relevant data:
   - Product search (if query mentions products)
   - Cart info (if authenticated + cart-related)
   - Order history (if authenticated + order-related)
5. **Context Formatting** → Convert data to LLM prompt
6. **LLM Processing** → GROQ generates response
7. **Action Extraction** → Identify required actions
8. **Response Delivery** → Send with suggestions/products

### Hallucination Prevention

1. **Strict Context Grounding**
   - System prompt instructs: "NEVER invent product details"
   - Only mention products from provided context
   - Admit when information is unavailable

2. **Data Validation**
   - All product data from database
   - Price/stock checks before responses
   - Order status verification

3. **Response Formatting**
   - Include product IDs for verification
   - Provide actionable buttons
   - Link to actual pages/products

4. **Conversation Context**
   - Track mentioned products
   - Maintain conversation history
   - Reference previous queries appropriately

### Authentication Flow

```javascript
// Guest User
sessionId: generated + stored in localStorage
userId: null
capabilities: limited to browsing

// Authenticated User
sessionId: preserved from guest session
userId: linked on login
capabilities: full access (cart, orders, etc.)
```

### Session Management

- **Guest Sessions**: Created on first interaction
- **Session Persistence**: Stored in localStorage
- **Session Migration**: Guest → User on login
- **Session Cleanup**: Auto-archive after 30 days inactivity

## 🎨 UI/UX Features

### Chat Window
- Clean, modern design
- Smooth animations
- Typing indicators
- Timestamp display
- User/assistant message distinction

### Product Display
- Inline product cards
- Thumbnail images
- Price and stock info
- Click to view details

### Action Buttons
- "Proceed to Checkout"
- "View Cart"
- "Continue Shopping"
- "Track Order"
- Custom actions based on context

### Quick Actions
- Pre-defined helpful queries
- One-click common questions
- Context-aware suggestions

## 🔐 Security

- ✅ JWT authentication for protected routes
- ✅ User-specific data isolation
- ✅ Session validation
- ✅ Rate limiting (can be added)
- ✅ Input sanitization
- ✅ No sensitive data in responses

## 📊 Database Schema

### Conversation Model
```javascript
{
  userId: ObjectId | null,
  sessionId: String (unique),
  messages: [{
    role: 'user' | 'assistant' | 'system',
    content: String,
    timestamp: Date,
    metadata: Object
  }],
  context: {
    isAuthenticated: Boolean,
    lastActivity: Date,
    relevantProducts: [ObjectId],
    cartInteraction: Boolean,
    orderInteraction: Boolean
  },
  status: 'active' | 'archived' | 'ended'
}
```

## 🚀 Usage Examples

### Example 1: Product Search
```
User: "Show me brass fittings under ₹50"
Bot: [Searches products] "Here are some brass fittings under ₹50:"
     [Product cards displayed]
     "Would you like details on any of these?"
```

### Example 2: Add to Cart (Authenticated)
```
User: "Add the M20 cable gland to my cart"
Bot: "Great! I've added 1 M20 Cable Gland to your cart."
     [View Cart] [Checkout] [Continue Shopping]
```

### Example 3: Order Tracking
```
User: "Where is my recent order?"
Bot: "Your order #12345 is currently 'In Transit'."
     "Expected delivery: Dec 25, 2024"
     "Tracking: XYZ123456"
     [Track Order] [View Details]
```

## 🛠️ Customization

### Modify System Prompt
Edit `getSystemPrompt()` in `server/routes/chatbotRoutes.js`

### Add New Actions
1. Update `ragService.extractActions()`
2. Add handler in `ChatBot.jsx`
3. Implement backend route if needed

### Change AI Model
Modify `this.model` in `server/services/groqService.js`

### Styling
Edit Tailwind classes in `frontend/src/components/ChatBot.jsx`

## 🐛 Troubleshooting

### Chatbot not responding
- Check GROQ_API_KEY in .env
- Verify API key is valid
- Check console for errors
- Ensure backend is running

### Products not showing
- Check database connection
- Verify product data exists
- Check RAG service queries

### Authentication issues
- Verify JWT token
- Check token expiration
- Ensure auth middleware works

### Session not persisting
- Check localStorage
- Verify sessionId generation
- Check cookie/storage settings

## 📈 Future Enhancements

- [ ] Voice input support
- [ ] Multi-language support
- [ ] Image-based product search
- [ ] Advanced analytics dashboard
- [ ] Conversation summaries
- [ ] Sentiment analysis
- [ ] Smart notifications
- [ ] Integration with payment gateway
- [ ] Export conversation history
- [ ] Admin conversation monitoring

## 🧪 Testing

### Test Pre-Login Features
1. Clear localStorage
2. Open chatbot
3. Try: "Show products", "What categories?", "Help"

### Test Post-Login Features
1. Login to account
2. Try: "Show my cart", "Recent orders", "Add X to cart"

### Test Hallucination Prevention
1. Ask about non-existent products
2. Verify bot admits lack of information
3. Ensure no made-up details

## 📚 API Documentation

### Send Message
```http
POST /api/chatbot/message
Authorization: Bearer <token> (optional)
Content-Type: application/json

{
  "message": "Show me brass fittings",
  "sessionId": "session_123456"
}

Response:
{
  "success": true,
  "response": "Here are the brass fittings...",
  "sessionId": "session_123456",
  "products": [...],
  "suggestedActions": [...]
}
```

### Get Conversation
```http
GET /api/chatbot/conversation/:sessionId
Authorization: Bearer <token> (optional)

Response:
{
  "success": true,
  "conversation": {
    "messages": [...],
    "context": {...}
  }
}
```

### Add to Cart via Chat
```http
POST /api/chatbot/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "abc123",
  "quantity": 2
}

Response:
{
  "success": true,
  "message": "Great! I've added 2 items...",
  "cart": {...},
  "suggestedActions": [...]
}
```

## 📝 Notes

- Chatbot uses **llama-3.3-70b-versatile** model for fast responses
- Session cleanup runs automatically (can add cron job)
- Conversations auto-archive after 30 days
- Maximum context window: 8 recent messages
- Response time: typically 1-3 seconds

## 🙏 Credits

- **AI Model**: GROQ (Llama 3.3 70B)
- **Framework**: MERN Stack
- **UI**: React + Tailwind CSS
- **Database**: MongoDB

## 📄 License

Part of Nexus Network Products - All rights reserved

---

**Happy Chatting! 🤖💬**
