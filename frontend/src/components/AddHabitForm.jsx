import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    <Card className="p-3 shadow-sm mt-3 bg-light">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>Habit Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Target Days</Form.Label>
          <Form.Control
            type="number"
            value={target}
            onChange={e => setTarget(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button type="submit" variant="success">Add Habit</Button>
          <Button variant="outline-secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </Form>
    </Card>
  );
}

export default AddHabitForm;
