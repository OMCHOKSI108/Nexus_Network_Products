# NexusNetwork - Deployment Guide

## 🚀 Deployment Instructions (Vercel + Render)

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Render account (sign up at render.com)
- MongoDB Atlas database (already configured)

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your GitHub repositories

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `OMCHOKSI108/Nexus_Network_Products`
3. Configure the service:
   - **Name**: `nexusnetwork-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:

```
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
DB_CLUSTER=nexusnetwork.sz7r7g5
DB_NAME=NexusNetwork
DB_APPNAME=NexusNetwork
PORT=3004
NODE_ENV=production
JWT_SECRET=your_secure_random_string_here
EMAIL_USER=omchoksi99@gmail.com
EMAIL_PASS=etbyghjnbrgnnjfv
CORS_ORIGIN=https://your-frontend-app.vercel.app
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL (e.g., `https://nexusnetwork-backend.onrender.com`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update API URL
1. In your local project, create `.env` file in `frontend` folder:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

2. Update all service files to use the API URL from config:
   - `frontend/src/services/authService.js`
   - `frontend/src/services/cartService.js`
   - `frontend/src/services/productService.js`
   - Update `const API_BASE_URL` to import from `../config/api`

### Step 2: Push Changes to GitHub
```bash
cd "frontend"
# Add .env to .gitignore (already done)
cd ..
git add .
git commit -m "Add deployment configuration for Vercel and Render"
git push origin main
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click **"Add New Project"**
4. Import `OMCHOKSI108/Nexus_Network_Products`
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 4: Add Environment Variable in Vercel
In Vercel project settings → Environment Variables:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL (e.g., `https://nexus-network.vercel.app`)

### Step 6: Update CORS in Render
1. Go back to Render dashboard
2. Update `CORS_ORIGIN` environment variable with your Vercel URL
3. Redeploy the backend

---

## Part 3: Verify Deployment

### Test Backend
Visit: `https://your-backend-url.onrender.com/api/products`
Should return JSON with products

### Test Frontend
1. Visit your Vercel URL
2. Browse products
3. Test login/signup
4. Test cart functionality
5. Test contact form
6. Test admin dashboard

---

## 🔧 Troubleshooting

### Backend Issues
- **Error: CORS**: Make sure `CORS_ORIGIN` matches your Vercel URL exactly
- **Error: MongoDB**: Verify DB credentials in Render environment variables
- **Error: Email**: Check EMAIL_PASS is correct (no spaces)

### Frontend Issues
- **API not working**: Verify `VITE_API_URL` in Vercel environment variables
- **404 errors**: Check `vercel.json` is in frontend folder
- **Build fails**: Check for console errors in Vercel build logs

---

## 📝 Post-Deployment Checklist

- [ ] Backend API responding at Render URL
- [ ] Frontend loading at Vercel URL
- [ ] User registration working
- [ ] Login/logout working
- [ ] Products displaying correctly
- [ ] Cart functionality working
- [ ] Checkout process working
- [ ] Contact form sending emails
- [ ] Admin dashboard accessible
- [ ] Images loading properly

---

## 🎉 Your App is Live!

**Frontend URL**: https://your-app.vercel.app
**Backend URL**: https://your-backend.onrender.com

**Admin Login**:
- Email: Kalpeshbhai@gmail.com
- Password: KalpeshP@123

---

## 💡 Important Notes

1. **Free Tier Limitations**:
   - Render free tier spins down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds
   - Consider upgrading to paid tier for production use

2. **Environment Variables**:
   - Never commit `.env` files to GitHub
   - Always use environment variables for sensitive data
   - Update CORS_ORIGIN when changing domains

3. **Custom Domain** (Optional):
   - Vercel: Add custom domain in project settings
   - Render: Add custom domain in service settings
   - Update CORS_ORIGIN accordingly

---

## 🔄 Making Updates

After making code changes:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Both Vercel and Render will automatically redeploy!

---

## 📞 Support

If you encounter issues:
- Check Render logs: Dashboard → Service → Logs
- Check Vercel logs: Dashboard → Project → Deployments → View Logs
- Verify all environment variables are set correctly
