const nodemailer = require('nodemailer');

// Support SMTP configuration or fallback to Gmail service using EMAIL_USER/EMAIL_PASS
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
  NODE_ENV,
  EMAIL_ALLOW_SELF_SIGNED
} = process.env;

let transporterOptions = {};
if (SMTP_HOST) {
  transporterOptions = {
    host: SMTP_HOST,
    port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
    secure: SMTP_SECURE === 'true' || SMTP_PORT === '465',
    auth: EMAIL_USER && EMAIL_PASS ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined
  };
} else {
  transporterOptions = {
    service: 'gmail',
    auth: {
      user: EMAIL_USER || 'omchoksi99@gmail.com',
      pass: EMAIL_PASS || 'jfaq xdhn zcee sxwp'
    }
  };
}

const allowSelfSigned = EMAIL_ALLOW_SELF_SIGNED === 'true' || NODE_ENV !== 'production';
if (allowSelfSigned) transporterOptions.tls = { rejectUnauthorized: false };

const transporter = nodemailer.createTransport(transporterOptions);

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send contact form email
const sendContactEmail = async (formData) => {
  const { name, email, subject, message } = formData;

  const mailOptions = {
    from: process.env.EMAIL_FROM || EMAIL_USER || 'no-reply@nexusnetwork',
    to: 'omchoksi99@gmail.com',
    replyTo: email,
    subject: `Contact Form: ${subject || 'New Message'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">New Contact Form Submission</h2>
        
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong style="color: #374151;">Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong style="color: #374151;">Email:</strong> <a href="mailto:${email}" style="color: #1e40af;">${email}</a></p>
          <p style="margin: 10px 0;"><strong style="color: #374151;">Subject:</strong> ${subject || 'No subject'}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Message:</h3>
          <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 12px;">
          <p>This email was sent from the NexusNetwork contact form.</p>
          <p>Reply directly to this email to respond to ${name}.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Send password reset OTP email
const sendPasswordResetOTP = async (userEmail, otp, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || EMAIL_USER || 'no-reply@nexusnetwork',
    to: userEmail,
    subject: 'Password Reset OTP - Nexus Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello ${userName || 'User'},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We received a request to reset your password for your Nexus Network account. Use the OTP below to reset your password:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">Your OTP Code:</p>
            <div style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ This OTP will expire in 10 minutes.</strong>
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 20px;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            This is an automated email from Nexus Network Products
          </p>
          <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} Nexus Network. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

// Send password reset confirmation email
const sendPasswordResetConfirmation = async (userEmail, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || EMAIL_USER || 'no-reply@nexusnetwork',
    to: userEmail,
    subject: 'Password Reset Successful - Nexus Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Password Reset Successful</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello ${userName || 'User'},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Your password has been successfully reset. You can now log in to your Nexus Network account with your new password.
          </p>
          
          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              <strong>✓ Your account is secure.</strong> If you didn't make this change, please contact us immediately.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 20px;">
            For security reasons, we recommend:
          </p>
          <ul style="color: #6b7280; font-size: 14px; line-height: 1.8;">
            <li>Use a strong, unique password</li>
            <li>Don't share your password with anyone</li>
            <li>Enable two-factor authentication if available</li>
          </ul>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            This is an automated email from Nexus Network Products
          </p>
          <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} Nexus Network. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw error;
  }
};

// Transactional emails
const sendOrderConfirmation = async (userEmail, order) => {
  const company = process.env.COMPANY_NAME || 'NexusNetwork';
  const dateStr = new Date().toLocaleString('en-IN');
  const mailOptions = {
    from: process.env.EMAIL_FROM || EMAIL_USER || 'no-reply@nexusnetwork',
    to: userEmail,
    subject: `Order Confirmation - ${order.orderNumber || ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:700px; margin:0 auto;">
        <h2 style="color:#111">${company} - Order Confirmation</h2>
        <p style="color:#6b7280; font-size:12px;">Date: ${dateStr}</p>
        <p>Thank you for your order. Order number: <strong>${order.orderNumber}</strong></p>
        <p>Total: <strong>₹${(order.total||0).toFixed(0)}</strong></p>
        <div style="margin-top:12px;">
          <h4 style="margin:6px 0;">Order Summary</h4>
          <ul style="padding-left:16px; color:#374151">
            ${(order.items || []).map(it => `<li>${it.productName || it.name} — Qty: ${it.quantity} — ₹${it.subtotal || it.price}</li>`).join('')}
          </ul>
        </div>
        <p style="margin-top:12px;">We will notify you when your order status changes.</p>
      </div>
    `
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendOtpEmail = async (userEmail, order, otp) => {
  const company = process.env.COMPANY_NAME || 'NexusNetwork';
  const dateStr = new Date().toLocaleString('en-IN');
  const mailOptions = {
    from: process.env.EMAIL_FROM || (EMAIL_USER || 'no-reply@nexusnetwork'),
    to: userEmail,
    subject: `Delivery OTP for Order ${order.orderNumber || ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:700px; margin:0 auto;">
        <h2 style="color:#111">${company} - Delivery OTP</h2>
        <p style="color:#6b7280; font-size:12px;">Date: ${dateStr}</p>
        <p>Your one-time delivery code for order <strong>${order.orderNumber}</strong> is:</p>
        <p style="font-size:24px; font-weight:700; letter-spacing:2px;">${otp}</p>
        <p>This code expires in ${process.env.OTP_TTL_SECONDS || 300} seconds.</p>
      </div>
    `
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

const { generateReceiptBuffer } = require('../utils/pdfReceipt');
const sendReceiptEmail = async (userEmail, order) => {
  const pdfBuffer = await generateReceiptBuffer(order);
  const company = process.env.COMPANY_NAME || 'NexusNetwork';
  const dateStr = new Date().toLocaleString('en-IN');
  const mailOptions = {
    from: process.env.EMAIL_FROM || (EMAIL_USER || 'no-reply@nexusnetwork'),
    to: userEmail,
    subject: `Payment Receipt - ${order.orderNumber || ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:700px; margin:0 auto;">
        <h2 style="color:#111">${company} - Payment Receipt</h2>
        <p style="color:#6b7280; font-size:12px;">Date: ${dateStr}</p>
        <p>Please find attached your receipt for order <strong>${order.orderNumber}</strong>.</p>
      </div>
    `,
    attachments: [
      { filename: `${order.orderNumber || 'receipt'}.pdf`, content: pdfBuffer }
    ]
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendPasswordResetOtp = async (userEmail, otp) => {
  const company = process.env.COMPANY_NAME || 'NexusNetwork';
  const dateStr = new Date().toLocaleString('en-IN');
  const mailOptions = {
    from: process.env.EMAIL_FROM || (EMAIL_USER || 'no-reply@nexusnetwork'),
    to: userEmail,
    subject: `${company} - Password Reset OTP`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:700px; margin:0 auto;">
        <h2 style="color:#111">${company} - Password Reset</h2>
        <p style="color:#6b7280; font-size:12px;">Date: ${dateStr}</p>
        <p>Your password reset code is:</p>
        <p style="font-size:24px; font-weight:700; letter-spacing:2px;">${otp}</p>
        <p>This code expires in ${process.env.OTP_TTL_SECONDS || 300} seconds.</p>
      </div>
    `
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { 
  sendContactEmail, 
  sendOrderConfirmation, 
  sendOtpEmail,
  sendReceiptEmail, 
  sendPasswordResetOtp,
  sendPasswordResetOTP,
  sendPasswordResetConfirmation
};
