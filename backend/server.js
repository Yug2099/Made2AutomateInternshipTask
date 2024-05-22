const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors"); // Import CORS middleware
dotenv.config();

connectDB();

const app = express();

app.use(express.json());

// Enable CORS for all requests
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"], // Allow credentials (e.g., cookies, authorization headers)
  })
);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000; // Set a default port if PORT environment variable is not defined

app.listen(PORT, console.log(`Server started at port ${PORT}`));
