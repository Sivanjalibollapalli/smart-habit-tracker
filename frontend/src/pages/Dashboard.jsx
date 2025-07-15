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

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [habitInsights, setHabitInsights] = useState({});
  const [reminderTimes, setReminderTimes] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [showChart, setShowChart] = useState(false);

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="text-center mb-2 fw-bold text-primary">HabitFlow</h2>
            <p className="text-center text-muted mb-4">
              Build better habits, one day at a time. Track your progress and stay motivated.
            </p>

            <div className="text-center my-4">
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: 'auto',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0, 114, 255, 0.4)'
              }}>
                {habitsCompletedToday}/{habits.length}
              </div>
              {habitsCompletedToday === habits.length && habits.length > 0 ? (
                <p className="mt-3 fw-bold text-success">🎉 All habits complete!</p>
              ) : (
                <p className="mt-3 fw-bold text-warning">💪 Keep going!</p>
              )}
            </div>

            <div className="text-center my-4">
              <Button
                onClick={suggestHabit}
                style={{
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                  boxShadow: '0 4px 10px rgba(0, 114, 255, 0.4)',
                  border: 'none'
                }}
              >
                🧠 Suggest a New Habit
              </Button>
            </div>

            {showForm && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <AddHabitForm onHabitAdded={fetchHabits} onCancel={() => setShowForm(false)} />
              </motion.div>
            )}
          </motion.div>

          <motion.div layout className="row mt-4">
            {habits.map((habit) => {
              const progress = habit.targetDays
                ? Math.min((habit.completionDates?.length || 0) / habit.targetDays * 100, 100)
                : 0;

              return (
                <motion.div layout key={habit._id} className="col-md-4 mb-3">
                  <Card className={`${styles.habitCard} shadow`}>
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
                          🎯 {habit.targetDays - (habit.completionDates?.length || 0)} days left
                        </small>
                      )}

                      {habitInsights[habit._id] && (
                        <div className="mt-2">
                          <p className="text-muted">
                            🤖 Success Prediction: {habitInsights[habit._id].success_chance?.toFixed(2)}%
                          </p>
                          {habitInsights[habit._id].suggestions?.map((tip, index) => (
                            <p className="text-danger small mb-1" key={index}>💡 {tip}</p>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

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
