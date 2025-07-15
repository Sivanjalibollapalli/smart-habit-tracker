import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  // ✅ Navigate after login success
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      toast.success('Login successful!');
      setIsLoggedIn(true); // ✅ trigger navigation via useEffect
    } catch (err) {
      toast.error('Invalid credentials');
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
            Track your daily habits, stay accountable, visualize progress, and get AI-powered predictions
            on your success. Build life-changing routines with ease.
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
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
          <h2 className="mb-3 text-center fw-bold">Welcome Back</h2>
          <p className="text-center text-muted">Login to continue your habit journey</p>
          <form onSubmit={handleSubmit}>
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
            <div className="mb-3">
              <input
                type="password"
                name="password"
                className="form-control rounded-pill px-4"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill mb-3"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-4 text-center">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
