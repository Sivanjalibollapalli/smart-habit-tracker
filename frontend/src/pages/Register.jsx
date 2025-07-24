import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './Register.module.css';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [strength, setStrength] = useState('');
  const [loading, setLoading] = useState(false);

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
      className={styles.bg}
      style={{
        minHeight: '100vh',
        background: "url('/dashboard.jpg') center center/cover no-repeat",
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(30, 42, 62, 0.35)',
        zIndex: 0
      }} />
      {/* Main content (register panels) */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Left Description Panel */}
        <div className={styles.leftPanel}>
          <h1 className={styles.title}>Smart Habit Tracker</h1>
          <p className={styles.desc}>
            Build better habits, track progress, and get insights powered by AI. Our platform empowers
            you to achieve long-term success, one habit at a time.
          </p>
        </div>
        {/* Right Register Panel */}
        <div className={styles.rightPanel}>
          <div className={styles.registerBox}>
            <h2 className={styles.registerTitle}>Create Account</h2>
            <p className={styles.registerSubtitle}>Start your habit journey today!</p>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="username"
                  id="register-username"
                  className={styles.input}
                  placeholder=" "
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
                <label className={styles.floatingLabel} htmlFor="register-username">Username</label>
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  id="register-email"
                  className={styles.input}
                  placeholder=" "
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                <label className={styles.floatingLabel} htmlFor="register-email">Email</label>
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  id="register-password"
                  className={styles.input}
                  placeholder=" "
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <label className={styles.floatingLabel} htmlFor="register-password">Password</label>
              </div>
              <div className={styles.strengthBar}>
                <span className={
                  strength === 'Strong' ? styles.strong :
                  strength === 'Medium' ? styles.medium :
                  strength === 'Weak' && form.password ? styles.weak : ''
                }>
                  Password Strength: {strength}
                </span>
              </div>
              <button
                type="submit"
                className={styles.registerBtn}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <p className={styles.loginText}>
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
