const mongoose = require('mongoose');
const habitLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: String }, // ISO date string
  completed: Boolean,
}, { timestamps: true });
module.exports = mongoose.model('HabitLog', habitLogSchema);