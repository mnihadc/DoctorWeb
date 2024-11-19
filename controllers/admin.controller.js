const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

const dashboard = async (req, res, next) => {
  try {
    const users = await User.find({});
    const waitingUsers = await User.find({ isWaitingForCall: true });
    console.log(waitingUsers);

    res.render("admin/Dashboard", {
      title: "User Management",
      layout: "Layout/main",
      isDashboardPage: true,
      users,
      waitingUsers,
      isAdmin: req.user?.isAdmin, // Use req.user from token to check if admin
      isAuthenticated: !!req.user, // Check if user exists in token
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const { username, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    await User.findByIdAndDelete(id);
    res.status(204).json({ message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    next(error);
  }
};
const getWaitingUsers = async (req, res, next) => {
  try {
    const waitingUsers = await User.find({ isWaitingForCall: true });

    res.render("AdminDashboard", {
      title: "Admin Dashboard",
      layout: "Layout/admin",
      waitingUsers,
    });
  } catch (error) {
    console.error("Error fetching waiting users:", error);
    next(error);
  }
};

module.exports = {
  dashboard,
  updateUser,
  deleteUser,
  createUser,
  getWaitingUsers,
};
