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
      pass: EMAIL_PASS || ''
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

module.exports = { sendContactEmail };

// Transactional emails
const sendOrderConfirmation = async (userEmail, order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || EMAIL_USER || 'no-reply@nexusnetwork',
    to: userEmail,
    subject: `Order Confirmation - ${order.orderNumber || ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:700px; margin:0 auto;">
        <h2 style="color:#111">Order Confirmation</h2>
        <p>Thank you for your order. Order number: <strong>${order.orderNumber}</strong></p>
        <p>Total: <strong>₹${(order.total||0).toFixed(0)}</strong></p>
        <p>We will notify you when your order status changes.</p>
      </div>
    `
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendOtpEmail = async (userEmail, order, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || (EMAIL_USER || 'no-reply@nexusnetwork'),
    to: userEmail,
    subject: `Delivery OTP for Order ${order.orderNumber || ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:700px; margin:0 auto;">
        <h2 style="color:#111">Your Delivery OTP</h2>
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
  const mailOptions = {
    from: process.env.EMAIL_FROM || (EMAIL_USER || 'no-reply@nexusnetwork'),
    to: userEmail,
    subject: `Payment Receipt - ${order.orderNumber || ''}`,
    html: `<div style="font-family: Arial, sans-serif;"><p>Please find attached your receipt for order <strong>${order.orderNumber}</strong>.</p></div>`,
    attachments: [
      { filename: `${order.orderNumber || 'receipt'}.pdf`, content: pdfBuffer }
    ]
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendContactEmail, sendOrderConfirmation, sendOtpEmail, sendReceiptEmail };
