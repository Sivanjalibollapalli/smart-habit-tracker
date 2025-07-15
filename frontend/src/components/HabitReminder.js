import React, { useState, useEffect } from 'react';

function HabitReminder({ habitId }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`reminder-${habitId}`);
    if (saved) setTime(saved);
  }, [habitId]);

  const handleSetReminder = e => {
    setTime(e.target.value);
    localStorage.setItem(`reminder-${habitId}`, e.target.value);
  };

  return (
    <div className="my-2">
      <label className="form-label small">⏰ Reminder Time:</label>
      <input
        type="time"
        className="form-control form-control-sm"
        value={time}
        onChange={handleSetReminder}
      />
    </div>
  );
}

export default HabitReminder;