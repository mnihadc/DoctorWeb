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
module.exports = { dashboard };
