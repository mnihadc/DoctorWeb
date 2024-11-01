const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const homeRoutes = require("./routes/homes.route");
const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");
const doctorRoutes = require("./routes/doctor.route");

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URI,
      collectionName: "sessions",
      ttl: 1 * 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    },
  })
);

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
hbs.registerPartials(path.join(__dirname, "views", "admin"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/user-css")));
app.use(express.static(path.join(__dirname, "public/admin-css")));

app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/doctor", doctorRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
