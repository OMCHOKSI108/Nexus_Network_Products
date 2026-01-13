# RAG Chatbot - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- ✅ GROQ_API_KEY in server/.env
- ✅ MongoDB connected
- ✅ Node.js installed
- ✅ Backend dependencies installed

### Step 1: Verify Installation
```bash
cd server
node test-chatbot.js
```

Expected output: ✅ GROQ API is working! ✅ All RAG tests passed!

### Step 2: Start Backend
```bash
cd server
npm start
```

Look for: `🚀 Server running on port 5000`

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

Look for: `Local: http://localhost:5173`

### Step 4: Test Chatbot

1. **Open browser**: http://localhost:5173
2. **Look for**: Blue chat button (bottom-right corner) 💬
3. **Click to open** chatbot
4. **Try these queries**:
   - "Show me available products"
   - "What categories do you have?"
   - "Show brass fittings"
   - "Help me find cable glands"

### Step 5: Test Authentication Features

1. **Login** to your account
2. **Try these queries**:
   - "Show my cart"
   - "Add [product name] to cart"
   - "Show my orders"
   - "What's in my cart?"

---

## 📋 Features Checklist

### ✅ Pre-Login (Guest Users)
- [ ] Product search works
- [ ] Category browsing
- [ ] Product information display
- [ ] Price and stock queries
- [ ] Navigation help
- [ ] Quick action buttons

### ✅ Post-Login (Authenticated)
- [ ] Cart management
- [ ] Add to cart via chat
- [ ] View cart summary
- [ ] Order history viewing
- [ ] Order tracking
- [ ] Checkout guidance

### ✅ UI/UX
- [ ] Chat button visible
- [ ] Chat window opens/closes
- [ ] Messages display correctly
- [ ] Product cards show inline
- [ ] Action buttons appear
- [ ] Typing indicator works
- [ ] Responsive on mobile

### ✅ RAG & AI
- [ ] Context-aware responses
- [ ] Accurate product info
- [ ] No hallucinations
- [ ] Natural language understanding
- [ ] Session persistence

---

## 🎯 Test Scenarios

### Scenario 1: Product Discovery
```
User: "I need brass fittings for M20 cable"
Expected: 
- List of M20 brass fittings
- Product cards with images
- Price and stock info
- "View Details" links
```

### Scenario 2: Add to Cart (Authenticated)
```
User: "Add the first product to my cart"
Expected:
- Success message
- Cart summary updated
- Action buttons: [View Cart] [Checkout]
```

### Scenario 3: Cart Summary
```
User: "What's in my cart?"
Expected:
- List of cart items
- Quantities and prices
- Total amount
- Action buttons
```

### Scenario 4: Guest User Cart Attempt
```
User: (Not logged in) "Add to cart"
Expected:
- Polite message about login required
- [Login] button appears
- Click login → opens login modal
```

### Scenario 5: Order Tracking
```
User: "Where is my recent order?"
Expected:
- Order number and status
- Estimated delivery
- Tracking number (if available)
- [Track Order] button
```

---

## 🐛 Troubleshooting

### Problem: Chatbot not responding
**Solution:**
```bash
# Check if GROQ API key is set
cd server
cat .env | grep GROQ_API_KEY

# Test GROQ connection
node test-chatbot.js

# Check server logs
npm start
```

### Problem: Products not showing
**Solution:**
```bash
# Check MongoDB connection
# In server logs, look for: ✅ MongoDB connected

# Check if products exist
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await Product.countDocuments();
  console.log('Products in DB:', count);
  process.exit(0);
});
"
```

### Problem: Authentication issues
**Solution:**
```bash
# Check JWT_SECRET in .env
cd server
cat .env | grep JWT_SECRET

# Test login manually
# Frontend → Login → Check browser console for token
```

### Problem: Session not persisting
**Solution:**
```javascript
// Open browser console (F12)
// Check localStorage
localStorage.getItem('chatbot_session_id')

// Clear and regenerate if needed
localStorage.removeItem('chatbot_session_id')
// Refresh page
```

---

## 📊 API Endpoints Reference

### Chatbot Main
```
POST   /api/chatbot/message              - Send message
GET    /api/chatbot/conversation/:id     - Get conversation
GET    /api/chatbot/conversations        - List all (auth)
DELETE /api/chatbot/conversation/:id     - End conversation
POST   /api/chatbot/feedback             - Submit feedback
```

### Chatbot Cart (Authenticated Only)
```
POST   /api/chatbot/cart/add             - Add to cart
GET    /api/chatbot/cart                 - Get cart
DELETE /api/chatbot/cart/item/:id        - Remove item
PUT    /api/chatbot/cart/item/:id        - Update quantity
DELETE /api/chatbot/cart/clear           - Clear cart
```

---

## 🔍 Monitoring

### Check Logs
```bash
# Backend logs
cd server
npm start
# Look for chatbot-related messages

# Frontend logs
# Open browser console (F12)
# Check for chatbot service calls
```

### Database Queries
```javascript
// Check conversations
use NexusNetwork
db.conversations.find().limit(5)

// Check active sessions
db.conversations.find({ status: 'active' }).count()

// Check recent messages
db.conversations.aggregate([
  { $unwind: '$messages' },
  { $sort: { 'messages.timestamp': -1 } },
  { $limit: 10 }
])
```

---

## 🎨 Customization

### Change Chatbot Position
Edit `frontend/src/components/ChatBot.jsx`:
```jsx
// Line ~180
className="fixed bottom-6 right-6..."
// Change to: bottom-6 left-6 (bottom-left)
```

### Change Chatbot Colors
```jsx
// Line ~195 - Header
className="bg-gradient-to-r from-blue-600 to-blue-700"
// Change to: from-green-600 to-green-700

// Line ~340 - Button
className="bg-blue-600..."
// Change to: bg-green-600...
```

### Add Custom Quick Actions
Edit `frontend/src/components/ChatBot.jsx`:
```jsx
// Line ~165
const quickActions = [
  { label: '🔍 Search', message: 'Show products' },
  // Add your custom action:
  { label: '🎁 Offers', message: 'Show me special offers' },
];
```

### Modify System Prompt
Edit `server/routes/chatbotRoutes.js`:
```javascript
// Line ~20 - getSystemPrompt function
// Customize instructions for the AI
```

---

## 📈 Performance Tips

1. **Session Cleanup**
   - Add cron job to archive old conversations
   - Run monthly: `Conversation.cleanupOldConversations(30)`

2. **Response Time**
   - Current: 1-3 seconds typical
   - Optimize by reducing context size
   - Use faster GROQ model if needed

3. **Database Indexing**
   - Already indexed: sessionId, userId, lastActivity
   - Monitor query performance

4. **Caching**
   - Consider caching common queries
   - Cache product search results (5-10 min)

---

## 🔐 Security Checklist

- [x] JWT authentication for protected routes
- [x] User data isolation (userId checks)
- [x] Session validation
- [x] Input sanitization (via Express)
- [x] No sensitive data in AI responses
- [ ] Rate limiting (optional - add if needed)
- [ ] CAPTCHA for high-volume users (optional)

---

## 📱 Mobile Testing

### iOS Safari
1. Open on iPhone
2. Test chat button tap
3. Check responsive layout
4. Test typing and scrolling

### Android Chrome
1. Open on Android device
2. Test all chatbot features
3. Check keyboard behavior
4. Test action buttons

---

## 🚢 Production Deployment

### Before Deploy:
1. ✅ Test all features locally
2. ✅ Check GROQ API limits/quota
3. ✅ Set production CORS_ORIGIN
4. ✅ Enable production MongoDB
5. ✅ Set NODE_ENV=production

### Environment Variables (Production):
```env
NODE_ENV=production
GROQ_API_KEY=gsk_your_production_key
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secure_random_secret
CORS_ORIGIN=https://yourdomain.com
```

### Monitor After Deploy:
- API response times
- GROQ API usage
- Database queries
- Error rates
- User feedback

---

## 🎓 Learning Resources

### GROQ Documentation
- https://console.groq.com/docs

### RAG Concepts
- Retrieval Augmented Generation basics
- Context window management
- Prompt engineering best practices

### MongoDB Aggregation
- For advanced conversation analytics

---

## 💡 Tips & Tricks

1. **Better Responses**: More specific queries = better results
2. **Context Matters**: Chatbot remembers last 8 messages
3. **Action Buttons**: Click instead of typing for speed
4. **Product IDs**: Chatbot provides IDs for easy reference
5. **Clear Chat**: Use trash icon to start fresh conversation

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review `docs/CHATBOT_GUIDE.md` for details
3. Check server logs and browser console
4. Test with `test-chatbot.js`

---

## ✨ What's Next?

Potential enhancements:
- Voice input/output
- Image-based product search
- Multi-language support
- Conversation analytics dashboard
- Integration with payment gateway
- Proactive suggestions
- Smart notifications

---

**Happy chatting! 🤖💬**

Last updated: January 2026
