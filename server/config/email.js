const nodemailer = require('nodemailer');

// Use environment variables when available
const { EMAIL_USER, EMAIL_PASS, NODE_ENV } = process.env;

// Build transporter options and allow self-signed certs when explicitly enabled
const transporterOptions = {
  service: 'gmail',
  auth: {
    user: EMAIL_USER || 'omchoksi99@gmail.com',
    pass: EMAIL_PASS || 'etbyghjnbrgn njfv'
  }
};

const allowSelfSigned = process.env.EMAIL_ALLOW_SELF_SIGNED === 'true' || NODE_ENV !== 'production';
if (allowSelfSigned) {
  transporterOptions.tls = { rejectUnauthorized: false };
}

// Create transporter with Gmail
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
    from: 'omchoksi99@gmail.com',
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
