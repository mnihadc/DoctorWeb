const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

const dashboard = async (req, res, next) => {
  const users = await User.find({});
  res.render("admin/Dashboard", {
    title: "User Management",
    layout: "Layout/main",
    isDashboardPage: true,
    users,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
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

const deleteUser = async (req, res) => {
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

module.exports = { dashboard, updateUser, deleteUser, createUser };
