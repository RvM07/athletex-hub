const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['monthly', 'quarterly', 'halfyearly', 'annual'], required: true },
  price: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  features: [{ type: String }]
}, { timestamps: true });

// Auto-expire memberships
MembershipSchema.pre('find', function() {
  this.where({ endDate: { $gt: new Date() } });
});

module.exports = mongoose.model('Membership', MembershipSchema);
