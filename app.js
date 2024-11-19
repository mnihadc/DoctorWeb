const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// Import routes
const homeRoutes = require("./routes/homes.route");
const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");
const doctorRoutes = require("./routes/doctor.route");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URI,
      collectionName: "sessions",
      ttl: 1 * 24 * 60 * 60, // 1 day
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true only in production
      maxAge: 3600000, // 1 hour
    },
  })
);

// MongoDB connection
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected successfully to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// View engine setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));
hbs.registerPartials(path.join(__dirname, "views", "admin"));

// Static file setup
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/user-css")));
app.use(express.static(path.join(__dirname, "public/admin-css")));
app.use(express.static(path.join(__dirname, "public/js")));

// Define routes
app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/doctor", doctorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Socket.io connection handling for WebRTC signaling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  // Handle WebRTC signaling events
  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("candidate", (data) => {
    socket.broadcast.emit("candidate", data);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
