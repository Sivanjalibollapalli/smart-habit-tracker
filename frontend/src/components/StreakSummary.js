import React from 'react';

function StreakSummary({ habits }) {
  const totalStreak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
  const longest = Math.max(...habits.map(h => h.streak || 0));

  return (
    <div className="alert alert-info text-center">
      🔥 Total Streaks: <strong>{totalStreak}</strong> | Longest Streak: <strong>{longest}</strong>
    </div>
  );
}

export default StreakSummary;