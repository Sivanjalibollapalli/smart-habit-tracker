import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      toast.success('Login successful!');
      navigate('/dashboard'); // Go directly to dashboard after login
    } catch (err) {
      toast.error('Invalid credentials');
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
      <div className={`${styles.loginCard} shadow-card`} style={{ position: 'relative', zIndex: 1 }}>
        <h2 className={styles.title}>Login</h2>
        <p style={{ textAlign: 'center', fontWeight: 500, fontSize: '1.2rem', color: '#fff', marginBottom: 20 }}>Welcome to Habitura</p>
        <form onSubmit={handleSubmit}>
          <label className={styles.formLabel} htmlFor="email">Email</label>
          <input
            className={styles.formInput}
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="username"
          />
          <label className={styles.formLabel} htmlFor="password">Password</label>
          <input
            className={styles.formInput}
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          <button className={styles.loginBtn + ' shadow-btn-hover'} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className={styles.signupText}>
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;