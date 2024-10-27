const getHome = (req, res, next) => {
  res.render("partials/Home", {
    title: "Home",
    layout: "Layout/main",
    isHomePage: true,
    isAuthenticated: !!req.session.user,
  });
};

module.exports = { getHome };
