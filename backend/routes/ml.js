// routes/ml.js
const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

router.post('/recommend', (req, res) => {
  const userHabits = req.body.habits;

  const py = spawn('python', ['ml-service/recommend.py', JSON.stringify(userHabits)]);

  let result = '';
  py.stdout.on('data', (data) => {
    result += data.toString();
  });

  py.stderr.on('data', (err) => {
    console.error('Python Error:', err.toString());
  });

  py.on('close', (code) => {
    if (code === 0) {
      res.json({ suggestion: result.trim() });
    } else {
      res.status(500).json({ error: 'Failed to get recommendation' });
    }
  });
});

module.exports = router;
