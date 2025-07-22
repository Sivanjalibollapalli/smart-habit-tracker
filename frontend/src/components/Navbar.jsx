import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Button } from 'react-bootstrap';
import styles from './Navbar.module.css';

function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className={styles.navbar + ' shadow-navbar'}>
      <Container className="d-flex justify-content-between">
        <span className={styles.navbarTitle}>Welcome, <strong>{username}</strong></span>
        <div className="d-flex align-items-center gap-3">
          
          <Button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </Button>
        </div>
      </Container>
    </nav>
  );
}

export default Navbar;
