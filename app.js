const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose");
const homeRoutes = require("./routes/home.route");

dotenv.config();
const app = express();
const port = process.env.PORT;

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected successfully to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Set up view engine and views directory
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Register partials directory for Handlebars
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/user-css")));

// Use routes
app.use("/", homeRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
