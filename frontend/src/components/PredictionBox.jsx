import React, { useState } from 'react';
import axios from 'axios';

function PredictionBox({ habit }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Safely handle missing habit
  if (!habit) {
    return <div className="alert alert-warning">No habit selected for prediction.</div>;
  }

  const wasCompletedYesterday = (habit) => {
    if (!habit.lastCompleted) return 0;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastDate = new Date(habit.lastCompleted).toISOString().split('T')[0];
    return yesterday === lastDate ? 1 : 0;
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/predict', {
        streak: habit.streak || 0,
        completed_yesterday: wasCompletedYesterday(habit),
      });
      setPrediction(res.data.probability);
    } catch (err) {
      console.error('Prediction error:', err);
      setPrediction('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" p-3 mb-3 ">
      
      <button className="btn btn-outline-warning w-100" onClick={handlePredict} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Habit Success'}
      </button>

      {prediction !== null && (
        <div className="alert alert-info text-center mt-3">
          🧠 Success Chance: <strong>{prediction}%</strong>
        </div>
      )}
    </div>
  );
}

export default PredictionBox;
