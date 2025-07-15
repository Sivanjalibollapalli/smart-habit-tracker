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
      name: req.body.name,
      description: req.body.description,
      targetDays: req.body.targetDays,
      reminderTime: req.body.reminderTime || '',  // ✅ save reminder time
      completedDays: 0,
      streak: 0,
      completionDates: [],
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
    const today = new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const alreadyLogged = await HabitLog.findOne({ userId, habitId, date: today });
    if (alreadyLogged || habit.completionDates?.includes(today)) {
      return res.status(400).json({ error: 'Already marked complete today' });
    }

    await HabitLog.create({ userId, habitId, date: today, completed: true });

    habit.completionDates = habit.completionDates || [];
    habit.completionDates.push(today);
    habit.completedDays = habit.completionDates.length;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastCompleted = habit.lastCompleted ? habit.lastCompleted.toISOString().split('T')[0] : null;

    habit.streak = lastCompleted === yesterday ? habit.streak + 1 : 1;
    habit.lastCompleted = new Date();

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
    const today = new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    await HabitLog.findOneAndDelete({ userId, habitId, date: today });

    habit.completionDates = habit.completionDates.filter(d => d !== today);
    habit.completedDays = habit.completionDates.length;

    const lastDate = habit.completionDates[habit.completionDates.length - 1];
    habit.streak = lastDate ? 1 : 0;
    habit.lastCompleted = lastDate ? new Date(lastDate) : null;

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
