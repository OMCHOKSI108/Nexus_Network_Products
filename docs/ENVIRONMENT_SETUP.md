# NexusNetwork - Environment Setup Guide

## Environment Variables Setup

This project uses separate environment files for different deployment platforms to avoid confusion.

### 📁 Files Created:
- `.env_vercel` - Frontend environment variables for Vercel
- `.env_render` - Backend environment variables for Render

### 🚀 Deployment Setup:

#### 1. Frontend (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Copy variables from `.env_vercel`:
   - `VITE_API_URL=https://nexus-network-products.onrender.com/api`

#### 2. Backend (Render)
1. Go to your Render service dashboard
2. Navigate to **Environment** → **Environment Variables**
3. Copy all variables from `.env_render`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`, `EMAIL_PASS`
   - `CORS_ORIGIN`
   - `CLOUDINARY_*` variables
   - `NODE_ENV=production`

### 🔒 Security Notes:
- Never commit real credentials to version control
- Use strong, unique passwords for production
- Change the `JWT_SECRET` to a secure random string
- The `.env_*` files are for reference only

### 🔄 After Updating Environment Variables:
1. **Redeploy both services** after updating environment variables
2. **Test the full application** to ensure everything works

### 📞 Support:
If you encounter issues, check the browser console for CORS errors and verify all environment variables are set correctly.