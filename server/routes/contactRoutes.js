import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Afro Task Contact" <${process.env.SMTP_USER}>`,
      to: [process.env.CONTACT_EMAIL_1, process.env.CONTACT_EMAIL_2].filter(Boolean).join(', '),
      replyTo: email.trim(),
      subject: `New Contact Message from ${name.trim()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00564C;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name.trim()}</p>
          <p><strong>Email:</strong> <a href="mailto:${email.trim()}">${email.trim()}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 8px;">
            ${message.trim().replace(/\n/g, '<br>')}
          </div>
          <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">Sent from Afro Task contact form</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

export default router;
