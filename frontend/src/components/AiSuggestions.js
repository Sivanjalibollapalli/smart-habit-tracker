import React from 'react';

const suggestionsMap = {
  Health: ['Stay hydrated!', 'Take a walk after meals.'],
  Study: ['Pomodoro method boosts focus.', 'Review notes daily.'],
  Productivity: ['Plan your day in the morning.', 'Use a to-do app.'],
  General: ['Set achievable daily goals.', 'Track consistency daily.']
};

function AiSuggestions({ category }) {
  const tips = suggestionsMap[category] || suggestionsMap['General'];
  return (
    <div className="mt-2">
      {tips.map((tip, idx) => (
        <div key={idx} className="text-secondary small">🤖 {tip}</div>
      ))}
    </div>
  );
}

export default AiSuggestions;