# Smart Habit Tracker – Project Overview & Frontend Q&A

## 1. Project Overview

The Smart Habit Tracker is a full-stack web application designed to help users build and maintain positive habits through tracking, analytics, and AI-powered suggestions. The project is architected with three main components: a React-based frontend, a Node.js/Express backend, and a Python/Flask machine learning (ML) service. The frontend provides a modern, responsive user interface where users can register, log in, manage their habits, receive notifications, and view progress analytics. The backend handles user authentication, data storage, and business logic, interfacing with a MongoDB database for persistent storage. The ML service offers advanced features such as habit success prediction and personalized habit recommendations, integrating seamlessly with the main application via RESTful APIs. Communication between the frontend and backend is secured using JWT tokens, and all services are configured to allow cross-origin requests for smooth development and integration. The project leverages a wide range of modern technologies and best practices to deliver a robust, scalable, and user-friendly experience.

## 2. Frontend Interview/Viva Questions & Answers

### 1. **What technologies are used in the frontend of this project?**
**Answer:** The frontend is built with React.js, using React Router for navigation, Axios for API calls, Bootstrap and React Bootstrap for styling, Framer Motion for animations, Chart.js and react-chartjs-2 for charts, react-calendar-heatmap for visualizing habit streaks, React Toastify for notifications, and Firebase for optional Google authentication.

### 2. **How does user authentication work in the frontend?**
**Answer:** Users log in or register via forms that send credentials to the backend using Axios. On successful login, a JWT token and username are stored in localStorage. This token is included in the Authorization header for all subsequent API requests. The app uses React Router to protect routes and redirects users based on authentication status.

### 3. **How are notifications implemented in the frontend?**
**Answer:** The app uses React Toastify for in-app toast notifications (e.g., login success, errors, habit completion) and the browser’s Notification API for desktop notifications, especially for habit reminders. Audio alerts can also be triggered for reminders.

### 4. **Describe the main features of the Dashboard.**
**Answer:** The Dashboard displays all user habits as cards, showing progress, completion status, and options to edit or delete. Users can mark habits as complete, set target days, and view progress via charts and a heatmap. The Dashboard also provides real-time countdowns for reminders and integrates AI-powered suggestions and success predictions from the ML service.

### 5. **How is navigation handled in the frontend?**
**Answer:** Navigation is managed using React Router DOM. The Navbar component displays the username and logout button, and navigation between pages is handled programmatically using the useNavigate hook.

### 6. **How does the frontend communicate with the backend and ML service?**
**Answer:** The frontend uses Axios to make HTTP requests to the backend (Node.js/Express) for authentication and habit management, always including the JWT token. For AI features, it sends requests to the ML service (Flask) on a separate port. CORS is enabled on both backend and ML service to allow cross-origin requests.

### 7. **What is the role of the .env file in the frontend?**
**Answer:** A .env file can be used to store environment-specific variables such as API URLs (e.g., REACT_APP_API_URL). This allows for easy switching between development and production environments without changing the codebase.

### 8. **How is state managed in the frontend?**
**Answer:** State is managed locally within components using React’s useState and useEffect hooks. Persistent data like tokens and reminder times are stored in localStorage. The app does not use a global state management library like Redux.

### 9. **What is async/await and how is it used in this project?**
**Answer:** async/await is a syntax for handling asynchronous operations in JavaScript. It makes code more readable and easier to maintain compared to promise chains. In this project, async/await is used for all API calls, form submissions, and side effects.

### 10. **How are API errors and token expiration handled?**
**Answer:** An Axios interceptor checks for 401 Unauthorized responses. If the token is expired or invalid, the user is automatically logged out, the token is removed from localStorage, and the user is redirected to the login page.

### 11. **How are charts and analytics implemented in the frontend?**
**Answer:** The app uses Chart.js (via react-chartjs-2) for progress charts and react-calendar-heatmap for visualizing habit streaks and completions.

### 12. **How does the frontend trigger AI-powered features?**
**Answer:** The frontend sends HTTP POST requests to the ML service for habit success prediction and recommendations, then displays the results in the Dashboard UI.

### 13. **How are reminders and countdowns managed?**
**Answer:** The app uses setInterval to update countdown timers for each habit. When a reminder time is reached, a browser notification and optional audio alert are triggered, and the reminder is reset.

### 14. **How is styling handled in the frontend?**
**Answer:** Styling is achieved using Bootstrap, React Bootstrap components, and CSS Modules for scoped, component-specific styles. Framer Motion is used for animations and transitions.

### 15. **What are some best practices followed in this frontend codebase?**
**Answer:** The codebase uses functional components, React Hooks, modular CSS, centralized API configuration, async/await for async operations, and clear separation of concerns between UI, state, and API logic.

---

This document provides a comprehensive overview and a set of key questions and answers to help you understand and present the frontend of the Smart Habit Tracker project with confidence. 