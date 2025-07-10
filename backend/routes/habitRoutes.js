const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  markHabitComplete,
  getHabitLogs
} = require('../controllers/habitController');

// Apply auth middleware globally
router.use(auth);

// Habit routes
router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:habitId/complete', markHabitComplete);
router.get('/:id/logs', getHabitLogs);

module.exports = router;
