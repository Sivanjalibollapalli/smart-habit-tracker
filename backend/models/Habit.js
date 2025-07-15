const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  description: String,
  icon: String,
  category: String,
  color: String,
  targetDays: { type: Number, default: 30 },
  completedDays: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastCompleted: { type: Date },
  reminderTime: {
  type: String, // Format: "HH:mm"
  default: null,
},
  completionDates: {
    type: [String], // Store as 'YYYY-MM-DD' (e.g., '2025-07-10')
    default: [],
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
