// 1. Import 'http' and 'Server' (from socket.io)
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http'); // Import Node.js http module
const { Server } = require("socket.io"); // Import socket.io Server
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Create an HTTP server from our Express app
const server = http.createServer(app);

// 3. Initialize Socket.IO server and configure CORS
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow our frontend to connect
        methods: ["GET", "POST"]
    }
});

// 4. Set up a middleware to pass 'io' to our routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// 5. Define Socket.IO connection logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// --- Routes ---
app.get('/', (req, res) => {
    res.send('Hello from the Tournament App Backend!');
});

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const tournamentsRouter = require('./routes/tournaments');
app.use('/api/tournaments', tournamentsRouter);

// 6. Start the server using 'server.listen' instead of 'app.listen'
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});