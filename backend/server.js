const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");
const socketio = require("socket.io");
const http = require("http"); // Import http module for creating the server

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server using Express app

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://my-group-chat.vercel.app",
      "https://chat-g8qz7gbk1-yug2099s-projects.vercel.app",
      "https://chatting-application-roan.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("API is running");
});
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Socket.IO setup
const io = socketio(server, {
  cors: {
    origin: [
      "https://my-group-chat.vercel.app",
      "https://chatting-application-roan.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat || !chat.users) {
      console.log("Chat or chat users not defined");
      return;
    }

    chat.users.forEach((user) => {
      if (user._id !== newMessageReceived.sender._id) {
        socket.in(user._id).emit("message received", newMessageReceived);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
