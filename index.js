const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Endpoint to save referral data
app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail, course } = req.body;

  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail || !course) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        course
      }
    });

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: refereeEmail,
      subject: 'Referral Received',
      text: `You have been referred to the course: ${course} by ${referrerName}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to send email' });
      }
      res.status(200).json(referral);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save referral' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
