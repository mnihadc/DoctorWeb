const User = require("../models/User.model");

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

    // Send back the updated user data as JSON
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { dashboard, updateUser };
