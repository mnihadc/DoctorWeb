const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const homeRoutes = require("./routes/home.route");
const authRoutes = require("./routes/auth.route");

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    },
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected successfully to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/user-css")));

// Use routes
app.use("/", homeRoutes);
app.use("/auth", authRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
