import React, { useState, useEffect } from 'react';

function HabitNotes({ habitId }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    const savedNote = localStorage.getItem(`note-${habitId}`);
    if (savedNote) setNote(savedNote);
  }, [habitId]);

  const handleChange = e => {
    setNote(e.target.value);
    localStorage.setItem(`note-${habitId}`, e.target.value);
  };

  return (
    <div className="mt-2">
      <textarea
        className="form-control"
        value={note}
        onChange={handleChange}
        rows={2}
        placeholder="📝 Add a quick note for this habit..."
      />
    </div>
  );
}

export default HabitNotes;