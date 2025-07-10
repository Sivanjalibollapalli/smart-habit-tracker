const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// GET all habits for logged-in user
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
};

// CREATE a new habit
exports.createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({
      userId: req.user.id,
      ...req.body,
      completedDays: 0,
      streak: 0,
    });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create habit' });
  }
};

// UPDATE an existing habit
exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

// MARK habit as complete for today
exports.markHabitComplete = async (req, res) => {
  try {
    const { habitId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const habit = await Habit.findById(habitId);
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const alreadyLogged = await HabitLog.findOne({ userId: req.user.id, habitId, date: today });
    if (alreadyLogged) return res.status(400).json({ error: 'Already marked complete today' });

    await HabitLog.create({ userId: req.user.id, habitId, date: today, completed: true });

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastCompleted = habit.lastCompleted ? habit.lastCompleted.toISOString().split('T')[0] : null;

    habit.completedDays += 1;
    habit.streak = lastCompleted === yesterday ? habit.streak + 1 : 1;
    habit.lastCompleted = new Date();

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark habit as complete' });
  }
};

// GET all logs for a habit (for Chart.js)
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
