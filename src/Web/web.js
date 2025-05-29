// require("dotenv").config();


// const express=require("express");
// const cors=require("cors");
// const morgan = require('morgan');
// const xss = require('xss-clean');
// const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
// const logger = require("../config/logger");
// const fs = require('fs');
// const path = require('path');
// const cookieParser = require("cookie-parser");







// const web=express();
// web.use(cookieParser());
// web.use(express.json());
// web.use(express.urlencoded({ extended: true }));
// // process.env.FRONTEND_URL || 'http://localhost:3000'
// web.use(cors({
//     origin: true,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
//   }));

//   web.use(
//     morgan('combined', {
//       stream: {
//         write: (message) => logger.info(message.trim()),
//       },
//     })
//   );


// web.use(xss());
// web.use(helmet());
// web.use(mongoSanitize());

// const logDir = 'logs';
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir);
// }

// web.get('/', (req, res) => {
//     logger.info('Hello route was called');
//     res.send('Hello World');
//   });

//   web.get('/error', (req, res) => {
//     logger.error('This is an error log example');
//     res.status(500).send('Error route');
//   });





// module.exports=web;
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger"); // Make sure this path is correct
const connectDB = require("../Database/connectDB");
// const logsRepo=require("../logs");
const authRoutes=require("../Routes/auth.routes");

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
web.use("/auth",authRoutes);
// web.get("/", (req, res) => {
//   logger.info("Hello route was called");
//   res.send("Hello World");
// });

// web.get("/error", (req, res) => {
//   logger.error("This is an error log example");
//   res.status(500).send("Error route");
// });

module.exports = web;
