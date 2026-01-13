# Email Troubleshooting Guide

## ✅ Server Status: WORKING
The test shows emails are being sent successfully from the server.

## 🔍 Possible Issues & Solutions

### 1. Check Spam/Junk Folder
- Gmail often filters automated emails as spam
- Check your **Spam** folder in Gmail
- Mark emails from your app as "Not Spam"

### 2. Gmail App Password Setup
Your current password looks like an App Password (format: `jfaq xdhn zcee sxwp`), which is correct.

**If emails still don't arrive:**

#### Generate a NEW App Password:
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Google Account (omchoksi99@gmail.com)
3. Click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other (Custom name)"
5. Enter "Nexus Network" and click "Generate"
6. Copy the 16-character password
7. Update your `.env` file:
   ```env
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
8. Restart the server

### 3. Gmail Security Settings
If App Passwords option is not available:

1. Enable 2-Step Verification:
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. After enabling 2FA, App Passwords will become available

### 4. Less Secure App Access (Deprecated)
Google no longer supports "Less secure app access". You MUST use App Passwords.

### 5. Check Email Delivery Logs

Run this test to see detailed logs:
```bash
cd server
node test-email.js
```

### 6. Test with Different Email
Try sending to a different email address to rule out Gmail blocking:

Edit `test-email.js` and change:
```javascript
const result = await sendPasswordResetOTP('YOUR_OTHER_EMAIL@example.com', '123456', 'Test User');
```

### 7. Check Gmail Filters
1. Open Gmail Settings → Filters and Blocked Addresses
2. Check if any filters are automatically deleting/archiving emails from your domain

### 8. Verify SMTP Connection
Current configuration:
- Service: Gmail
- User: omchoksi99@gmail.com
- Port: 465/587 (Gmail automatically selects)
- Secure: Yes

## 🧪 Quick Test Commands

### Test OTP Email:
```bash
cd server
node -e "require('dotenv').config(); const {sendPasswordResetOTP} = require('./config/email'); sendPasswordResetOTP('omchoksi99@gmail.com', '999888', 'Test').then(r => console.log('Sent:', r)).catch(e => console.error(e));"
```

### Check Server Logs:
```bash
cd server
nodemon
# Then trigger forgot password from frontend
```

## 📧 Email Delivery Status

Last test result: **SUCCESS ✅**
- OTP Email: Sent successfully
- Confirmation Email: Sent successfully
- Message IDs generated (emails reached Gmail servers)

## 🎯 Next Steps

1. **Check spam folder** (most common issue)
2. **Wait 2-3 minutes** (email delivery can be delayed)
3. **Generate new App Password** if still not receiving
4. **Test with different email** to isolate the issue
5. **Check Gmail filters** for auto-deletion rules

## 📱 Alternative: Use Temporary Email
Test with a temporary email service to verify delivery:
- https://temp-mail.org
- https://10minutemail.com

This will help determine if it's a Gmail-specific blocking issue.
