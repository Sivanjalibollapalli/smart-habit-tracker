const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  getHabits,
  createHabit,
  updateHabit,          // 🛠️ Supports reminderTime now
  deleteHabit,
  markHabitComplete,
  unmarkHabitComplete,
  getHabitLogs
} = require('../controllers/habitController');

// 🔒 Apply authentication middleware to all routes
router.use(auth);

// 📌 Habit Routes
router.get('/', getHabits);                         // Get all habits
router.post('/', createHabit);                      // Create new habit
router.put('/:id', updateHabit);                    // Update habit (name, desc, reminderTime etc.)
router.delete('/:id', deleteHabit);                 // Delete habit
router.post('/:habitId/complete', markHabitComplete);   // Mark complete
router.post('/:habitId/uncomplete', unmarkHabitComplete); // Undo completion
router.get('/:id/logs', getHabitLogs);              // Get habit logs

module.exports = router;
