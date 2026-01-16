const router = require('express').Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Membership = require('../models/Membership');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Dashboard Stats
router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalBookings = await Booking.countDocuments();
        
        // Calculate actual revenue from memberships
        const memberships = await Membership.find();
        const totalRevenue = memberships.reduce((sum, m) => sum + (m.price || 0), 0);
        
        // Count active members (users with active memberships)
        const activeMembers = await Membership.countDocuments({ 
            status: 'active',
            endDate: { $gt: new Date() }
        });

        res.json({
            totalUsers,
            totalBookings,
            totalRevenue,
            activeMembers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Also delete their bookings and membership? 
        // For now, keep it simple or cascade interactively.
        // Let's just delete the user document.
        await Booking.deleteMany({ user: req.params.id });
        await Membership.deleteMany({ user: req.params.id });
        
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Users (for Management)
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Booking Status
router.put('/bookings/:id/status', auth, adminAuth, async (req, res) => {
    try {
        const { status } = req.body; // 'confirmed' or 'cancelled'
        const booking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status },
            { new: true }
        ).populate('user', 'name email');
        
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Bookings with User details
router.get('/bookings', auth, adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('trainer', 'name')
            .sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
