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
const http = require('http');
const { Server } = require('socket.io');

const web = express();
connectDB();


// socket connection
const server = http.createServer(web);

const io = new Server(server, {
  cors: {
    origin: true, // allow frontend to connect (change '*' to specific domain in prod)
    methods: ['GET', 'POST',
      'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // credentials: true, // allow cookies to be sent
    
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('connect', () => {
    console.log(`Client connected: ${socket.id}`);
  });

  // chatting
  socket.on('message', (msg) => {
    console.log('Received:', msg);
    io.emit('message', msg); // broadcast to all
  });


  // online 
  socket.on("online-users", (data) => {
    console.log(data);
    io.emit("online-users", data); // broadcast to all
  });

  // Join a private room
  socket.on("join-room", (roomid) => {
    console.log(`Private Room  ID:${roomid}`);
     console.log("Socket ID:", socket.id);
     if (!roomid) return console.warn("Room ID missing!");
    socket.join(roomid);
  });

  // Receive message and emit only to that room
  socket.on("code-change", ({ roomid, code,fileName }) => {
    // console.log('Code changed data:', data);
    // console.log(`Code change in room : ${roomid}:`);

    // io.to(roomid).emit('code-change', data);
    if (!roomid) return console.warn("Room ID missing!");

    if(!fileName) {
      console.warn(" fileName is missing!");
      return;
    }
    

    //  io.emit('code-change', data);  
    io.to(roomid).emit('code-change', {  code,fileName });
  });

  // console.log("Socket rooms:", socket.rooms);
  

  // multi cursors
  socket.on("cursor-move", ({ roomid, cursorPosition,fileName,username }) => {
    // console.log('Cursor move data:', data);
    // console.log(`Cursor move in room : ${data.roomid}:`);
    if (!roomid) return console.warn("\nRoom ID missing!\n");
    // console.log("filename:", fileName);

    io.to(roomid).emit('cursor-move', {cursorPosition,fileName,username});
  });


  


  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
  });
});


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

// web.get("/", (req, res) => {
//   logger.info("Hello route was called");
//   res.send("Hello World");
// });

// web.get("/error", (req, res) => {
//   logger.error("This is an error log example");
//   res.status(500).send("Error route");
// });

module.exports = server;
