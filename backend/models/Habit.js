const mongoose = require('mongoose');
const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  description: String,
  icon: String,
  category: String,
  color: String,
  targetDays: Number,
  completedDays: Number,
  streak: {
  type: Number,
  default: 0
},
lastCompleted: {
  type: Date,
},
}, { timestamps: true });
module.exports = mongoose.model('Habit', habitSchema);