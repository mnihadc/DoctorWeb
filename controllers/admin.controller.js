const dashboard = (req, res, next) => {
  res.render("admin/Dashboard", {
    title: "User Management",
    layout: "Layout/main",
    isDashboardPage: true,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
};
module.exports = { dashboard };
