const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db';

// ==========================================================================
// EMAIL NOTIFICATION CONFIGURATION
// ==========================================================================
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('[EMAIL CONFIG] Nodemailer email transporter initialized.');
} else {
  console.log('[EMAIL CONFIG] Nodemailer email transporter not configured (missing EMAIL_USER/EMAIL_PASS).');
}

// ==========================================================================
// DATABASE CONFIGURATION
// ==========================================================================
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('[DNS CONFIG] DNS servers overridden to Google Public DNS to resolve Atlas SRV records.');
} catch (dnsErr) {
  console.warn('[DNS WARNING] Failed to override DNS servers:', dnsErr.message);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully at:', MONGODB_URI);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// Schema definition
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// ==========================================================================
// MIDDLEWARES
// ==========================================================================
app.use(cors());
app.use(express.json());

// Serve static frontend assets (HTML, CSS, JS, PDF, images)
app.use(express.static(path.join(__dirname, '.')));

// ==========================================================================
// API ROUTES
// ==========================================================================
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Simple validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payload missing required fields. Connection refused.' 
      });
    }

    let savedMessage;
    let signature;
    let storageType = 'MongoDB';

    try {
      // Save to MongoDB
      const newMessage = new Message({
        name,
        email,
        subject,
        message
      });
      savedMessage = await newMessage.save();

      signature = crypto.createHash('md5')
        .update(savedMessage._id.toString())
        .digest('hex')
        .substring(0, 10)
        .toUpperCase();

      console.log(`[DATABASE LOG] Saved contact message to MongoDB. Telemetry ID: SEC-MSG-${signature}`);
    } catch (dbErr) {
      console.warn(`[DATABASE WARNING] MongoDB connection failed. Falling back to local filesystem storage. Reason: ${dbErr.message}`);
      
      const tempId = new mongoose.Types.ObjectId();
      savedMessage = {
        _id: tempId,
        name,
        email,
        subject,
        message,
        timestamp: new Date()
      };

      signature = crypto.createHash('md5')
        .update(tempId.toString())
        .digest('hex')
        .substring(0, 10)
        .toUpperCase();

      storageType = 'Local Filesystem Fallback';

      // Save to messages.json in root directory
      const fs = require('fs');
      const messagesFilePath = path.join(__dirname, 'messages.json');
      
      let messagesList = [];
      if (fs.existsSync(messagesFilePath)) {
        try {
          const fileData = fs.readFileSync(messagesFilePath, 'utf8');
          messagesList = JSON.parse(fileData);
        } catch (readErr) {
          console.error('[FILESYSTEM ERROR] Failed to parse messages.json:', readErr.message);
        }
      }

      messagesList.push(savedMessage);
      fs.writeFileSync(messagesFilePath, JSON.stringify(messagesList, null, 2), 'utf8');
      console.log(`[FILESYSTEM LOG] Saved contact message to local JSON. Telemetry ID: SEC-MSG-${signature}`);
    }

    // Send email notification asynchronously (fail-safe, won't block response)
    if (transporter) {
      const mailOptions = {
        from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_RECEIVER || 'vrohith1009@gmail.com',
        subject: `New Portfolio Message: ${subject}`,
        text: `You have received a new contact message from your portfolio website.

Sender Info:
Name: ${name}
Email: ${email}
Subject: ${subject}
Date: ${new Date().toLocaleString()}
Signature Hash: SEC-MSG-${signature}

Message:
----------------------------------------------
${message}
----------------------------------------------`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #0070f3 0%, #00f2fe 100%); padding: 20px; text-align: center; color: white;">
              <h2 style="margin: 0; font-size: 20px;">New Contact Message Received</h2>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Telemetry ID: SEC-MSG-${signature}</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569; width: 100px;">From:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Email:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;"><a href="mailto:${email}" style="color: #0070f3; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Subject:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${subject}</td>
                </tr>
              </table>
              <div style="font-weight: bold; color: #475569; margin-bottom: 8px;">Message:</div>
              <div style="background-color: #f8fafc; border-left: 4px solid #0070f3; padding: 16px; border-radius: 4px; color: #334155; white-space: pre-wrap; font-size: 15px; line-height: 1.6;">
                ${message}
              </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
              This email was automatically generated by your Portfolio site backend.<br>
              Logged at: ${new Date().toLocaleString()}
            </div>
          </div>
        `
      };

      transporter.sendMail(mailOptions)
        .then(info => console.log(`[EMAIL LOG] Message forwarded to ${mailOptions.to}. Response: ${info.response}`))
        .catch(emailErr => console.error('[EMAIL ERROR] Failed to send email forwarding message:', emailErr.message));
    }

    res.status(200).json({
      success: true,
      message: `Message securely logged (${storageType}).`,
      hash: `SEC-MSG-${signature}`,
      data: {
        id: savedMessage._id,
        timestamp: savedMessage.timestamp
      }
    });

  } catch (err) {
    console.error('Critical error handling contact message API:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal secure buffer overflow. Message failed to save.' 
    });
  }
});

// Fallback to index.html for navigation routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================================================
// PORT BINDING
// ==========================================================================
app.listen(PORT, () => {
  console.log('======================================================');
  console.log(`[PORTFOLIO SERVER] Active and listening on port ${PORT}`);
  console.log(`[PORTFOLIO SERVER] Local Server URL: http://localhost:${PORT}`);
  console.log('======================================================');
});
