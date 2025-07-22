# Smart Habit Tracker – Frontend Developer Overview

The frontend of the Smart Habit Tracker is a modern, responsive web application built using React.js, designed to provide users with an intuitive and engaging experience for managing and tracking their daily habits. The project leverages a variety of contemporary frontend technologies and libraries to deliver a seamless user interface and robust functionality.

## Technologies Used
The application is primarily developed with **React** (v19+), utilizing functional components and React Hooks such as `useState`, `useEffect`, and `useCallback` for state and lifecycle management. For routing between pages like Login, Register, and Dashboard, **React Router DOM** is used, enabling smooth navigation without full page reloads. Styling is achieved through a combination of **Bootstrap** and **React Bootstrap** for layout and components, as well as CSS Modules for scoped, component-specific styles. Animations and transitions are handled by **Framer Motion**, providing a polished and dynamic user experience. Data visualization, such as progress charts and heatmaps, is implemented using **Chart.js** (via `react-chartjs-2`) and **react-calendar-heatmap`**. Notifications are managed with **React Toastify** for in-app toasts and the browser’s Notification API for desktop alerts. The app also integrates **Firebase** for optional Google authentication.

## Authentication (Login & Register)
User authentication is handled via forms on the Login and Register pages. When a user logs in or registers, their credentials are sent to the backend API using **Axios**. Upon successful login, a JWT token and username are stored in `localStorage`, which is then used to authenticate subsequent API requests. The app automatically redirects users based on authentication status, ensuring secure access to protected routes like the Dashboard. The authentication flow is robust, with error handling and user feedback provided through toast notifications.

## Dashboard & Core Features
The Dashboard is the central hub where users can view, add, edit, and delete their habits. Each habit is displayed as a card showing progress, completion status, and options for editing or deleting. Users can mark habits as complete, set target days, and view their progress visually through charts and a heatmap calendar. The Dashboard also features a real-time countdown timer for habit reminders, leveraging the browser’s Notification API to alert users when it’s time to work on a habit. Additionally, users can receive AI-powered habit suggestions and success predictions by interacting with the integrated ML service.

## Notifications
The frontend uses two notification systems: in-app toasts (via React Toastify) for immediate feedback (e.g., successful login, errors, habit completion) and browser notifications for habit reminders. When a reminder is due, the app triggers a desktop notification and can play an audio alert, ensuring users never miss their scheduled habits.

## Navigation (Navbar)
A custom Navbar component, styled with React Bootstrap and CSS Modules, provides navigation and user context. It displays the logged-in username and includes a logout button, which clears authentication data and redirects the user to the login page. Navigation between pages is handled programmatically using React Router’s `useNavigate` hook.

## API Integration & Backend Communication
All data interactions (login, register, habit CRUD operations, AI suggestions) are performed via RESTful API calls to the backend server using Axios. The API base URL is centrally configured, and an Axios interceptor manages token expiration and automatic logout. The frontend also communicates with a separate Python/Flask-based ML service for habit success predictions and recommendations, making HTTP requests to its endpoints and displaying results directly in the UI.

## State Management
State is managed locally within components using React’s `useState` and `useEffect` hooks. Persistent data, such as authentication tokens and reminder times, are stored in `localStorage` to maintain user sessions and preferences across browser reloads. The app does not use a global state management library (like Redux), as component-level state and localStorage are sufficient for its needs.

## Connecting Frontend to Backend & ML Service
The frontend connects to the backend (Node.js/Express) via HTTP requests to endpoints like `/api/auth/login`, `/api/habits`, etc., always including the JWT token for authentication. For AI features, it sends requests to the ML service (Flask) on a separate port. CORS is enabled on both backend and ML service to allow cross-origin requests from the frontend during development.

## Environment Variables (.env)
While not strictly required for the frontend, a `.env` file can be used to store API URLs and other configuration values (e.g., `REACT_APP_API_URL`). This allows for easy switching between development and production environments without changing the codebase.

## Async/Await Usage
All asynchronous operations, such as API calls and timers, are handled using the `async/await` syntax, which makes the code more readable and easier to maintain compared to traditional promise chains. This pattern is used throughout the app for fetching data, handling form submissions, and managing side effects.

---

This frontend codebase exemplifies best practices in modern React development, with a focus on user experience, maintainability, and seamless integration with backend and AI services. As a frontend developer, you’ll find the structure intuitive and the technology stack both powerful and industry-standard. 