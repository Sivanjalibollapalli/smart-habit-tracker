const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// Helper to auto-decrement daysLeft for missed days
function autoDecrementDaysLeft(habit) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const created = new Date(habit.createdAt);
  const daysSinceCreated = Math.floor((today - created) / (1000 * 60 * 60 * 24));
  // Always recalculate for old habits (one-time migration logic)
  if (
    habit.lastDecrementDate === null ||
    habit.lastDecrementDate === undefined ||
    habit.daysLeft === undefined ||
    habit.daysLeft === 0 ||
    habit.daysLeft > habit.targetDays
  ) {
    habit.daysLeft = Math.max(0, habit.targetDays - daysSinceCreated);
    habit.lastDecrementDate = today;
    return;
  }
  // Hybrid logic: decrement once per day, either on completion or at midnight
  const lastDecrement = new Date(habit.lastDecrementDate);
  let daysToDecrement = Math.floor((today - lastDecrement) / (1000 * 60 * 60 * 24));
  const lastCompletionStr = habit.lastCompletionDate ? new Date(habit.lastCompletionDate).toISOString().split('T')[0] : null;
  if (daysToDecrement > 0) {
    for (let i = 1; i <= daysToDecrement; i++) {
      const checkDate = new Date(lastDecrement.getTime() + i * 24 * 60 * 60 * 1000);
      const checkDateStr = checkDate.toISOString().split('T')[0];
      // Only decrement if not completed that day
      if (lastCompletionStr !== checkDateStr) {
        habit.daysLeft = Math.max(0, habit.daysLeft - 1);
      }
    }
    habit.lastDecrementDate = today;
  }
}

// GET all habits for logged-in user
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    // Auto-decrement daysLeft for all habits before returning
    for (const habit of habits) {
      autoDecrementDaysLeft(habit);
      await habit.save();
    }
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
};

// CREATE a new habit
exports.createHabit = async (req, res) => {
  try {
    const today = new Date();
    const habit = await Habit.create({
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description,
      targetDays: req.body.targetDays,
      reminderTime: req.body.reminderTime || '',
      completedDays: 0,
      streak: 0,
      completionDates: [],
      daysLeft: req.body.targetDays,
      lastDecrementDate: today,
    });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create habit' });
  }
};

// UPDATE a habit (includes reminderTime)
exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          targetDays: req.body.targetDays,
          reminderTime: req.body.reminderTime || '', // ✅ update reminder time
        },
      },
      { new: true }
    );

    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
};

// DELETE a habit
exports.deleteHabit = async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
};

// MARK habit complete
exports.markHabitComplete = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    // Auto-decrement for missed days before marking complete
    autoDecrementDaysLeft(habit);

    const alreadyLogged = await HabitLog.findOne({ userId, habitId, date: todayStr });
    if (alreadyLogged || habit.completionDates?.includes(todayStr)) {
      return res.status(400).json({ error: 'Already marked complete today' });
    }

    await HabitLog.create({ userId, habitId, date: todayStr, completed: true });

    habit.completionDates = habit.completionDates || [];
    habit.completionDates.push(todayStr);
    habit.completedDays = habit.completionDates.length;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastCompleted = habit.lastCompleted ? habit.lastCompleted.toISOString().split('T')[0] : null;

    habit.streak = lastCompleted === yesterday ? habit.streak + 1 : 1;
    habit.lastCompleted = today;

    // Hybrid logic: decrement daysLeft for today if not already done
    const lastDecrementStr = habit.lastDecrementDate ? new Date(habit.lastDecrementDate).toISOString().split('T')[0] : null;
    const lastCompletionStr = habit.lastCompletionDate ? new Date(habit.lastCompletionDate).toISOString().split('T')[0] : null;
    if (lastCompletionStr !== todayStr) {
      habit.daysLeft = Math.max(0, habit.daysLeft - 1);
      habit.lastDecrementDate = today;
      habit.lastCompletionDate = today;
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark habit as complete' });
  }
};

// UNDO habit completion
exports.unmarkHabitComplete = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    await HabitLog.findOneAndDelete({ userId, habitId, date: todayStr });

    habit.completionDates = habit.completionDates.filter(d => d !== todayStr);
    habit.completedDays = habit.completionDates.length;

    // Hybrid logic: if undoing completion for today, increase daysLeft by 1
    const lastCompletionStr = habit.lastCompletionDate ? new Date(habit.lastCompletionDate).toISOString().split('T')[0] : null;
    if (lastCompletionStr === todayStr) {
      habit.daysLeft = habit.daysLeft + 1;
      habit.lastCompletionDate = null;
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to undo habit completion' });
  }
};

// GET habit logs
exports.getHabitLogs = async (req, res) => {
  try {
    const logs = await HabitLog.find({
      userId: req.user.id,
      habitId: req.params.id,
    }).sort('date');

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch habit logs' });
  }
};
