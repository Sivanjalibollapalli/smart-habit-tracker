import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AddHabitForm from '../components/AddHabitForm';
import EditHabitModal from '../components/EditHabitModal';
import axios from 'axios';
import { Badge, Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import moment from 'moment';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import styles from './Dashboard.module.css';
import ProgressChart from '../components/ProgressChart';
import { getWeather } from '../utils/weather';
import { useRef } from 'react';

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [habitInsights, setHabitInsights] = useState({});
  const [reminderTimes, setReminderTimes] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [showChart, setShowChart] = useState(false);
  const [missedDays, setMissedDays] = useState({});
  const [weather, setWeather] = useState(null);
  const [showSummary, setShowSummary] = useState({}); // { [habitId]: true/false }
  const notifiedHabitsRef = useRef({}); // To avoid duplicate notifications

  const fetchHabitInsights = async (habit) => {
    try {
      const res = await axios.post('http://localhost:5001/predict', {
        streak: habit.streak,
        targetDays: habit.targetDays || 7,
        completions: habit.completionDates || [],
      });
      setHabitInsights((prev) => ({
        ...prev,
        [habit._id]: {
          success_chance: res.data.success_chance,
          suggestions: res.data.suggestions || [],
        },
      }));
    } catch (err) {
      console.error("ML prediction failed:", err);
    }
  };

  const fetchHabits = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/habits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(res.data);
      res.data.forEach(fetchHabitInsights);
    } catch (err) {
      console.error('Failed to fetch habits');
    }
  }, []);

  useEffect(() => {
    fetchHabits();
    Notification.requestPermission();
  }, [fetchHabits]);

  useEffect(() => {
    const savedReminders = localStorage.getItem('reminderTimes');
    if (savedReminders) {
      setReminderTimes(JSON.parse(savedReminders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reminderTimes', JSON.stringify(reminderTimes));
  }, [reminderTimes]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = moment();
      let updatedCountdowns = {};

      habits.forEach((habit) => {
        const reminder = reminderTimes[habit._id];
        if (reminder) {
          const reminderMoment = moment(reminder, 'HH:mm');
          const diffSeconds = reminderMoment.diff(now, 'seconds');

          if (diffSeconds > 0) {
            const duration = moment.duration(diffSeconds, 'seconds');
            updatedCountdowns[habit._id] = `${duration.minutes()}m ${duration.seconds()}s`;
          } else {
            toast.info(`⏰ Reminder: Time to work on "${habit.name}"`);
            if (Notification.permission === 'granted') {
              new Notification(`Reminder for: ${habit.name}`);
            }
            try {
              const audio = new Audio('/ding.mp3');
              audio.play().catch(err => console.warn("Audio failed:", err));
            } catch (err) {
              console.warn("Audio play not supported.");
            }
            setReminderTimes((prev) => ({ ...prev, [habit._id]: '' }));
            updatedCountdowns[habit._id] = '';
          }
        }
      });

      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [habits, reminderTimes]);

  // Context-aware weather reminder (runs once on load)
  useEffect(() => {
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const weatherMain = await getWeather(pos.coords.latitude, pos.coords.longitude, apiKey);
        setWeather(weatherMain);
        // Only show for outdoor habits
        const outdoorKeywords = ['walk', 'run', 'cycle', 'jog', 'outdoor', 'hike'];
        habits.forEach(habit => {
          if (outdoorKeywords.some(word => habit.name.toLowerCase().includes(word) || (habit.description || '').toLowerCase().includes(word))) {
            if (weatherMain === 'Clear' || weatherMain === 'Clouds') {
              toast.info(`It's ${weatherMain.toLowerCase()}! Great time for your "${habit.name}" habit.`);
            }
          }
        });
      } catch (e) {
        // Ignore weather errors
      }
    });
    // eslint-disable-next-line
  }, [habits]);

  // Add this useEffect at the top level, after other useEffects
  useEffect(() => {
    habits.forEach((habit) => {
      if (habit.targetDays) {
        const daysSinceCreated = moment().diff(moment(habit.createdAt), 'days');
        const daysLeft = habit.targetDays - daysSinceCreated;
        if (daysLeft === 0) {
          // Count missed days
          const createdDate = moment(habit.createdAt).startOf('day');
          let missed = 0;
          for (let i = 0; i < habit.targetDays; i++) {
            const date = createdDate.clone().add(i, 'days').format('YYYY-MM-DD');
            if (!habit.completionDates?.includes(date)) missed++;
          }
          toast.info(`You missed ${missed} days for your "${habit.name}" habit.`);
        }
      }
    });
  }, [habits]);

  // Show summary when daysLeft reaches 0
  useEffect(() => {
    const updatedShowSummary = { ...showSummary };
    habits.forEach(habit => {
      if (habit.daysLeft === 0 && !notifiedHabitsRef.current[habit._id]) {
        updatedShowSummary[habit._id] = true;
        notifiedHabitsRef.current[habit._id] = true;
      }
    });
    setShowSummary(updatedShowSummary);
  }, [habits]);

  // Missed yesterday notification (only for habits created before yesterday)
  useEffect(() => {
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    habits.forEach(habit => {
      if (!habit.targetDays) return;
      if (moment(habit.createdAt).isAfter(moment().subtract(1, 'days').endOf('day'))) return;
      const completed = new Set(habit.completionDates || []);
      const missedYesterday = !completed.has(yesterday);
      if (missedYesterday && !notifiedHabitsRef.current[habit._id + '_missed']) {
        toast.warn(`You missed "${habit.name}" yesterday.`);
        notifiedHabitsRef.current[habit._id + '_missed'] = true;
      }
    });
  }, [habits]);

  // Helper to get all days in the last N days
  const getLastNDates = (n) => {
    const dates = [];
    for (let i = 0; i < n; i++) {
      dates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
    }
    return dates;
  };

  // Check for missed yesterday and the day before for each habit
  useEffect(() => {
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const dayBefore = moment().subtract(2, 'days').format('YYYY-MM-DD');
    habits.forEach(habit => {
      if (!habit.targetDays) return;
      // Only check for missed days if the habit was created before yesterday
      if (moment(habit.createdAt).isAfter(moment().subtract(1, 'days').endOf('day'))) return;
      const completed = new Set(habit.completionDates || []);
      const missedYesterday = !completed.has(yesterday);
      const missedDayBefore = !completed.has(dayBefore);
      if (missedYesterday && missedDayBefore) {
        toast.warn(`You missed "${habit.name}" yesterday and the day before.`);
      } else if (missedYesterday) {
        toast.warn(`You missed "${habit.name}" yesterday.`);
      }
    });
  }, [habits]);

  // Helper to calculate longest streak
  function getLongestStreak(dates) {
    if (!dates || dates.length === 0) return 0;
    const sorted = [...dates].sort();
    let maxStreak = 1, currentStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = moment(sorted[i - 1]);
      const curr = moment(sorted[i]);
      if (curr.diff(prev, 'days') === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return maxStreak;
  }

  const markHabitComplete = async (habitId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:5000/api/habits/${habitId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHabits();
      toast.success('Habit marked as completed!');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const undoHabitComplete = async (habitId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:5000/api/habits/${habitId}/uncomplete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHabits();
      toast.info('Habit completion undone');
    } catch (err) {
      toast.error('Failed to undo completion');
    }
  };

  const handleDelete = async (habitId) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await axios.delete(`http://localhost:5000/api/habits/${habitId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchHabits();
        toast.success('Habit deleted successfully!');
      } catch (err) {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const handleSaveEdit = async (updatedHabit) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/habits/${updatedHabit._id}`, updatedHabit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHabits();
      toast.success('Habit updated successfully!');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const today = moment().format('YYYY-MM-DD');
  const habitsCompletedToday = habits.filter(habit =>
    habit.completionDates?.includes(today)
  ).length;

  const suggestHabit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5001/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          habits: habits.map((h) => h.name),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`🤖 Suggested Habit: ${data.suggestion}`);
        console.log("Current habits before suggestion:", habits);

      } else {
        toast.error(data.error || 'Failed to get suggestion');
      }
    } catch (err) {
      toast.error('Failed to fetch habit');
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.dashboardContainer}>
        <div className="container mt-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className={styles.sectionTitle + " text-center mb-2"}>HabitFlow</h2>
            <motion.p
              className={styles.dashboardSubtitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              🌟 Build better habits, one day at a time. Track your progress and stay motivated.
            </motion.p>

            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className={styles.statCircle + " my-4"}>
              {habitsCompletedToday}/{habits.length}
            </motion.div>
            {habitsCompletedToday === habits.length && habits.length > 0 ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 fw-bold text-success">🎉 All habits complete!</motion.p>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 fw-bold text-warning">💪 Keep going!</motion.p>
            )}

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="text-center my-4">
              <Button
                onClick={suggestHabit}
                className={styles.glowButton}
              >
                🧠 Suggest a New Habit
              </Button>
            </motion.div>

            {showForm && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                <AddHabitForm onHabitAdded={fetchHabits} onCancel={() => setShowForm(false)} />
              </motion.div>
            )}
          </motion.div>

          <div className="row mt-4">
            {habits.map((habit, idx) => {
              // Use daysLeft from backend
              const daysLeft = habit.daysLeft ?? (habit.targetDays ? habit.targetDays : 0);
              const progress = habit.targetDays
                ? Math.min((habit.completionDates?.length || 0) / habit.targetDays * 100, 100)
                : 0;
              const daysCompleted = habit.completionDates?.length || 0;
              const daysMissed = habit.targetDays ? habit.targetDays - daysCompleted : 0;
              const longestStreak = getLongestStreak(habit.completionDates);

              return (
                <motion.div
                  key={habit._id}
                  className="col-md-6 col-lg-4 mb-4"
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 + idx * 0.1, type: "spring", stiffness: 80 }}
                >
                  <Card className="habitCard shadow-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Card.Title className="text-primary fw-bold mb-1">
                            {habit.name}
                            <Form.Control
                              type="time"
                              size="sm"
                              className="mt-1"
                              value={reminderTimes[habit._id] || ''}
                              onChange={(e) => setReminderTimes(prev => ({
                                ...prev,
                                [habit._id]: e.target.value
                              }))}
                            />
                            {countdowns[habit._id] && (
                              <small className="text-muted d-block mt-1">
                                ⏳ {countdowns[habit._id]} remaining
                              </small>
                            )}
                          </Card.Title>
                          <Card.Text className="text-muted small mb-1">{habit.description}</Card.Text>
                          <Badge bg="info" text="light" className="mb-2">🔥 {habit.streak || 0} day streak</Badge>
                        </div>
                        <div className="d-flex gap-1 flex-wrap justify-content-end">
                          <Button size="sm" variant="outline-success" onClick={() => markHabitComplete(habit._id)}>✅</Button>
                          <Button size="sm" variant="outline-primary" onClick={() => {
                            setSelectedHabit(habit);
                            setShowModal(true);
                          }}>✏️</Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(habit._id)}>🗑️</Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => undoHabitComplete(habit._id)}>↩️</Button>
                        </div>
                      </div>

                      <div className="my-2" style={{ maxHeight: '100px', overflow: 'hidden' }}>
                        <div onClick={() => setShowChart(true)} style={{ cursor: 'pointer' }}>
                          <CalendarHeatmap
                            startDate={moment().subtract(365, 'days').toDate()}
                            endDate={new Date()}
                            values={(habit.completionDates || []).map(date => ({ date, count: 1 }))}
                            classForValue={value => value ? 'color-filled' : 'color-empty'}
                            gutterSize={1}
                            showWeekdayLabels={false}
                          />
                        </div>
                      </div>

                      <div className="progress mb-1" style={{ height: '6px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${progress.toFixed(0)}%` }}
                        />
                      </div>
                      <small className="text-muted">{progress.toFixed(0)}% complete</small>

                      {habit.targetDays && (
                        <small className="text-muted d-block mt-1">
                          🎯 {daysLeft > 0 ? daysLeft : 0} days left
                        </small>
                      )}

                      {habitInsights[habit._id] && (
                        <div className="mt-2">
                          <p className="text-muted">
                             Success Prediction: {habitInsights[habit._id].success_chance?.toFixed(2)}%
                          </p>
                          {(habitInsights[habit._id].suggestions && habitInsights[habit._id].suggestions.length > 0) ? (
                            habitInsights[habit._id].suggestions.map((tip, index) => (
                              <p className="text-danger small mb-1" key={index}>💡 {tip}</p>
                            ))
                          ) : (
                            <p className="text-danger small mb-1">💡 Try breaking your habit goal into smaller chunks.</p>
                          )}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {showChart && (
            <>
              <div className="text-center mt-4 mb-2">
                <Button
                  variant=""
                  onClick={() => setShowChart(false)}
                  className="fw-bold"
                >
                  ❌
                </Button>
              </div>
              <ProgressChart habits={habits} />
            </>
          )}

          {/* Summary Modal/Toast for completed habits */}
          {habits.map(habit => (
            showSummary[habit._id] && (
              <div key={habit._id} className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">🎉 Habit Complete!</h5>
                      <button type="button" className="btn-close" onClick={() => setShowSummary(s => ({ ...s, [habit._id]: false }))}></button>
                    </div>
                    <div className="modal-body">
                      <p>You finished your "{habit.name}" habit cycle.</p>
                      <ul>
                        <li>Days completed: {habit.completionDates?.length || 0}</li>
                        <li>Days missed: {habit.targetDays ? habit.targetDays - (habit.completionDates?.length || 0) : 0}</li>
                        <li>Longest streak: {getLongestStreak(habit.completionDates)}</li>
                      </ul>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-primary" onClick={() => setShowSummary(s => ({ ...s, [habit._id]: false }))}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}

          {selectedHabit && (
            <EditHabitModal
              show={showModal}
              handleClose={() => {
                setShowModal(false);
                setSelectedHabit(null); // ✅ clear selected habit
              }}
              habit={selectedHabit}
              onSave={handleSaveEdit}
            />
          )}
        </div>
      </div>

      <Button
        variant="primary"
        className="position-fixed bottom-0 end-0 m-4 rounded-circle shadow"
        style={{ width: '50px', height: '50px', fontSize: '24px', padding: 0 }}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '×' : '+'}
      </Button>
    </>
  );
}

export default Dashboard;
