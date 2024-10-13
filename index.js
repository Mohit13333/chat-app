import express from 'express';
import http from 'http';
import { Server } from 'socket.io';


const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors());

// Serve static files (client-side)
app.use(express.static('src'));

// Track active users
let users = 0;

io.on('connection', (socket) => {
    // If users limit is reached, notify and disconnect
    if (users >= 2) {
        socket.emit('chatFull'); // Inform client that chat is full
        socket.disconnect();     // Disconnect the socket
        return;
    }

    // Increment user count and broadcast message to other users
    users++;
    console.log(`User connected. Total users: ${users}`);
    socket.broadcast.emit('userConnected', `A new user has joined the chat.`);

    // Handle chat messages
    socket.on('chatMessage', (data) => {
        io.emit('chatMessage', data); // Broadcast message to all clients
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        users--;
        console.log(`User disconnected. Total users: ${users}`);
        socket.broadcast.emit('userDisconnected',` A user has left the chat.`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});