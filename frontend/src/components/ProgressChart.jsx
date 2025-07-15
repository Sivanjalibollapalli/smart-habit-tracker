// ✅ ProgressChart.jsx
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
//import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
//import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ProgressChart({ habits = [] }) {
  const [view, setView] = useState('weekly');

  const filterHabits = (habitsList) => {
    const cutoff = new Date(Date.now() - (view === 'weekly' ? 7 : 30) * 86400000);
    return habitsList.filter(habit => {
      if (!habit.logs || !Array.isArray(habit.logs)) return true;
      return habit.logs.some(log => new Date(log.date) >= cutoff);
    });
  };

  const filtered = filterHabits(habits);

  const data = {
    labels: filtered.map(h => h.name),
    datasets: [
      {
        label: `Habit Streak (${view})`,
        data: filtered.map(h => h.streak || 0),
        borderColor:'', // 🔵 Line color changed here
        backgroundColor: 'rgba(0, 114, 255, 0.2)', // 🔵 Soft fill under line
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0072FF',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0072FF',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Your ${view.charAt(0).toUpperCase() + view.slice(1)} Habit Progress`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1,
      },
    },
  };



  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <select className="form-select w-auto" value={view} onChange={(e) => setView(e.target.value)}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
       
      </div>

      {filtered.length === 0 ? (
        <div className="alert alert-info text-center">
          No habits to display. Mark some habits complete to see your progress.
        </div>
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
}

export default ProgressChart;
