const router = require('express').Router();
const Contact = require('../models/Contact');

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || '',
      subject,
      message
    });

    res.status(201).json({
      message: 'Message sent successfully! We will get back to you soon.',
      contact: {
        id: contact._id,
        name: contact.name,
        subject: contact.subject
      }
    });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contacts (admin only)
router.get('/all', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
