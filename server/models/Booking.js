const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['visit', 'class', 'personal_training'], required: true },
  className: { type: String }, // Store the specific class name (e.g., "Yoga", "CrossFit")
  trainerName: { type: String }, // Store trainer name for display
  date: { type: Date, required: true },
  // For classes or PT, we might need time slot
  timeSlot: { type: String }, 
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', default: null },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
