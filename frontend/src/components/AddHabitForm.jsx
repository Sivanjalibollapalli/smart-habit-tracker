import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './AddHabitForm.module.css';
import { motion } from 'framer-motion';

function AddHabitForm({ onHabitAdded, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'http://localhost:5000/api/habits',
        { name, description, targetDays: target },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Habit added successfully!');
      onHabitAdded();
      setName('');
      setDescription('');
      setTarget('');
      if (onCancel) onCancel(); // close form
    } catch (err) {
      console.error('Error adding habit:', err);
      toast.error('Failed to add habit.');
    }
  };

  return (
    <motion.div
      className={styles.addHabitCard + ' shadow-card'}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, type: 'spring', bounce: 0.25 }}
    >
      <div className={styles.addHabitTitle}>Add a New Habit</div>
      <form onSubmit={handleSubmit}>
        <label className={styles.formLabel} htmlFor="habit-name">Habit Name</label>
        <input
          id="habit-name"
          className={styles.formInput}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <label className={styles.formLabel} htmlFor="habit-target">Target Days</label>
        <input
          id="habit-target"
          className={styles.formInput}
          type="number"
          value={target}
          onChange={e => setTarget(e.target.value)}
          required
        />
        <label className={styles.formLabel} htmlFor="habit-desc">Description</label>
        <input
          id="habit-desc"
          className={styles.formInput}
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div className={styles.buttonRow}>
          <button type="submit" className={styles.addBtn}>Add Habit</button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}

export default AddHabitForm;
