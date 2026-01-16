const router = require('express').Router();
const Membership = require('../models/Membership');
const auth = require('../middleware/auth');

// Membership plans config
const plans = {
  monthly: { id: 'monthly', name: 'Monthly', price: 2000, duration: 30 },
  quarterly: { id: 'quarterly', name: 'Quarterly', price: 5000, duration: 90 },
  halfyearly: { id: 'halfyearly', name: 'Half Yearly', price: 8000, duration: 180 },
  annual: { id: 'annual', name: 'Annual', price: 15000, duration: 365 }
};

// Get all available plans
router.get('/plans', (req, res) => {
  res.json(Object.values(plans));
});

// Get all memberships (Admin)
router.get('/', async (req, res) => {
  try {
    const memberships = await Membership.find().populate('user', 'name email');
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user's active membership
router.get('/my', auth, async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ endDate: -1 });
    
    if (!membership) {
      return res.status(404).json({ message: 'No active membership found' });
    }
    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get membership status (alias for frontend)
router.get('/status', auth, async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ endDate: -1 });
    
    if (!membership) {
      return res.json({ active: false, message: 'No active membership' });
    }
    res.json({ 
      active: true, 
      membership,
      plan: membership.plan,
      expiresAt: membership.endDate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Purchase membership
router.post('/purchase', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!plans[plan]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    const selectedPlan = plans[plan];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.duration);
    
    // Check for existing active membership
    const existingMembership = await Membership.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });
    
    if (existingMembership) {
      // Extend existing membership
      existingMembership.endDate = new Date(existingMembership.endDate);
      existingMembership.endDate.setDate(existingMembership.endDate.getDate() + selectedPlan.duration);
      existingMembership.plan = plan;
      existingMembership.price = selectedPlan.price;
      await existingMembership.save();
      return res.json({ 
        message: 'Membership extended successfully!', 
        membership: existingMembership 
      });
    }
    
    // Create new membership
    const newMembership = new Membership({
      user: req.user.id,
      plan,
      price: selectedPlan.price,
      startDate,
      endDate,
      status: 'active'
    });
    
    const savedMembership = await newMembership.save();
    res.json({ 
      message: 'Membership purchased successfully!', 
      membership: savedMembership 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subscribe to membership (alias for /purchase for frontend compatibility)
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = planId;
    
    if (!plans[plan]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    const selectedPlan = plans[plan];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.duration);
    
    // Check for existing active membership
    const existingMembership = await Membership.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });
    
    if (existingMembership) {
      // Extend existing membership
      existingMembership.endDate = new Date(existingMembership.endDate);
      existingMembership.endDate.setDate(existingMembership.endDate.getDate() + selectedPlan.duration);
      existingMembership.plan = plan;
      existingMembership.price = selectedPlan.price;
      await existingMembership.save();
      return res.json({ 
        message: 'Membership extended successfully!', 
        membership: existingMembership 
      });
    }
    
    // Create new membership
    const newMembership = new Membership({
      user: req.user.id,
      plan,
      price: selectedPlan.price,
      startDate,
      endDate,
      status: 'active'
    });
    
    const savedMembership = await newMembership.save();
    res.json({ 
      message: 'Subscribed successfully!', 
      membership: savedMembership 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Membership (Admin)
router.post('/', auth, async (req, res) => {
  try {
    const newMembership = new Membership(req.body);
    const savedMembership = await newMembership.save();
    res.json(savedMembership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
