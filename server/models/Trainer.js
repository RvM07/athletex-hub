const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  bio: { type: String },
  image: { type: String, default: 'https://via.placeholder.com/150' },
  experience: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Trainer', TrainerSchema);
