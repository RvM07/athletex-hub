const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is not set!');
  console.log('Please add MONGO_URI to your Render environment variables');
} else {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('✓ MongoDB Connected'))
  .catch(err => console.error('✗ MongoDB Connection Error:', err.message));
}

// Routes
const authRoutes = require('./routes/auth');
const trainerRoutes = require('./routes/trainers');
const bookingRoutes = require('./routes/bookings');
const membershipRoutes = require('./routes/memberships');
const contactRoutes = require('./routes/contact');

app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.send('AthleteX API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
