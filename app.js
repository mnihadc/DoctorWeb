const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const homeRoutes = require("./routes/home.route");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
