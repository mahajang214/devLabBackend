require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cookieParser = require('cookie-parser');
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger"); // Make sure this path is correct
const connectDB = require("../Database/connectDB");
const { exec } = require("child_process");
// const logsRepo=require("../logs");
const authRoutes = require("../Routes/auth.routes");
const mainRoutes = require("../Routes/main.routes");
const chatRoutes = require("../Routes/chat.routes");
const aiRoutes = require("../Routes/ai.routes");
const codeRoutes = require("../Routes/code.routes");

const web = express();
connectDB();



// Middleware order matters:
// 1. Parse cookies

web.use(cookieParser());

// 2. Parse JSON and urlencoded bodies
web.use(express.json());
web.use(express.urlencoded({ extended: true }));

// 3. CORS - you can customize origin as needed
web.use(
  cors({
    origin: true, // change 'true' to specific origin for better security
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 4. Morgan HTTP request logging with Winston logger
web.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// 5. Security middlewares
// web.use(xss());
// web.use(helmet());
// web.use(mongoSanitize());

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, "./logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Routes
web.use("/auth", authRoutes);
web.use("/main", mainRoutes);
web.use("/chat", chatRoutes);
web.use("/code", codeRoutes);
// web.use("/ai",aiRoutes);
// web.get("/", (req, res) => {
//   logger.info("Hello route was called");
//   res.send("Hello World");
// });

// web.get("/error", (req, res) => {
//   logger.error("This is an error log example");
//   res.status(500).send("Error route");
// });

module.exports = web;
