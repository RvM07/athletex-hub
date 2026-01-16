const router = require('express').Router();
const Trainer = require('../models/Trainer');

// Get all trainers
router.get('/', async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a trainer (Admin only - simplified for now)
router.post('/', async (req, res) => {
  try {
    const newTrainer = new Trainer(req.body);
    const savedTrainer = await newTrainer.save();
    res.json(savedTrainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
