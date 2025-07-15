import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Button } from 'react-bootstrap';

function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <BSNavbar bg="light" expand="lg" className="shadow-sm mb-3">
      <Container className="d-flex justify-content-between">
        <span className="fw-bold fs-4 text-primary">Welcome, <strong>{username}</strong></span>
        <div className="d-flex align-items-center gap-3">
          
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;
