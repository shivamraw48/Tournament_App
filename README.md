# Tournament App

Welcome to the Tournament App! This is a full-stack web application that allows users to register, log in, manage a wallet, and participate in tournaments. It features a modern frontend built with React and a robust backend powered by Node.js and Express.

## Live Demo & Screenshots

**(Optional) Add a link to your deployed application here!**

*[Link to Live Demo](https://your-deployment-link.com)*

**(Optional) Add a screenshot or a GIF of your application in action below.**

![App Screenshot](https://via.placeholder.com/800x450.png?text=Your+App+Screenshot+Here)

## Features

*   **User Authentication**: Secure user registration and login system using JSON Web Tokens (JWT).
*   **User Profiles**: Registered users have a profile page displaying their details and booked tournaments.
*   **Wallet System**: Users have a virtual wallet to manage funds for tournament entries.
*   **Real-time Updates**: Wallet balance updates are pushed to the client in real-time using WebSockets.
*   **Tournament Booking**: Users can view and book slots in available tournaments (backend logic is in place).
*   **Responsive UI**: A clean, modern user interface built with Material-UI.

## Tech Stack

### Frontend

*   **Framework/Library**: [React](https://reactjs.org/)
*   **UI Components**: [Material-UI (MUI)](https://mui.com/)
*   **Routing**: [React Router](https://reactrouter.com/)
*   **State Management**: [React Context API](https://reactjs.org/docs/context.html)
*   **HTTP Client**: [Axios](https://axios-http.com/)

### Backend

*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
*   **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/)
*   **Password Hashing**: [bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)
*   **Real-time Communication**: [Socket.IO](https://socket.io/)

## Project Structure

The project is organized into two main directories:

```
/
├── backend/      # Contains the Node.js, Express, and MongoDB server-side code.
└── frontend/     # Contains the React client-side application.
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/en/download/) (which includes npm)
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the `backend` directory and add the following variables. Replace the placeholder values with your own.

    ```env
    MONGO_URI=mongodb://localhost:27017/tournamentdb
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Start the backend server:**
    ```sh
    npm start
    ```
    The server will be running on `http://localhost:5000`.

### Frontend Setup

1.  **Open a new terminal** and navigate to the frontend directory:
    ```sh
    cd frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Start the React development server:**
    ```sh
    npm start
    ```
    The application will open automatically in your browser at `http://localhost:3000`.

## API Endpoints

The backend exposes the following user-related API endpoints:

*   `POST /api/users/register`: Register a new user.
*   `POST /api/users/login`: Log in a user and receive a JWT.
*   `GET /api/users/profile`: Get the logged-in user's profile and booked tournaments (Protected).
*   `PATCH /api/users/add-funds`: Add funds to a user's wallet.
*   `GET /api/users/profile-by-id/:id`: Get a user's public profile information by their ID.

---

This `README.md` was generated to provide a clear and concise overview of the project. Feel free to expand upon it as you add more features!