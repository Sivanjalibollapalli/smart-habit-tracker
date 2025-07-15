import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [strength, setStrength] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'password') {
      if (value.length < 6) setStrength('Weak');
      else if (/[A-Z]/.test(value) && /[0-9]/.test(value) && value.length >= 8) {
        setStrength('Strong');
      } else {
        setStrength('Medium');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Enter a valid email address.');
      return;
    }

    if (!form.username.trim()) {
      toast.error('Username is required.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.message?.includes('duplicate key error')) {
        toast.error('Username or email already exists.');
      } else {
        toast.error('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #9C6ADE, #ED8AC5)',
        color: 'white',
      }}
    >
      {/* Left Description Panel */}
      <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-5">
        <div>
          <h1 className="fw-bold display-5">Smart Habit Tracker</h1>
          <p className="mt-4" style={{ maxWidth: '400px', fontSize: '1.1rem' }}>
            Build better habits, track progress, and get insights powered by AI. Our platform empowers
            you to achieve long-term success, one habit at a time.
          </p>
        </div>
      </div>

      {/* Right Register Panel */}
      <div className="col-md-6 d-flex align-items-center justify-content-center p-4">
        <div
          className="w-100"
          style={{
            maxWidth: '400px',
            background: 'white',
            color: 'black',
            borderRadius: '20px',
            padding: '30px',
          }}
        >
          <h2 className="text-center fw-bold mb-3">Create Account</h2>
          <p className="text-center text-muted">Start your habit journey today!</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="username"
                className="form-control rounded-pill px-4"
                placeholder="Username"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                className="form-control rounded-pill px-4"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-1">
              <input
                type="password"
                name="password"
                className="form-control rounded-pill px-4"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-2">
              <small
                className={`text-${
                  strength === 'Strong' ? 'success' : strength === 'Medium' ? 'warning' : 'danger'
                }`}
              >
                Password Strength: {strength}
              </small>
            </div>

            <div className="mt-3">
              <button
                type="submit"
                className="btn btn-success w-100 rounded-pill"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
