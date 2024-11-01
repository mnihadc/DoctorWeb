const getHome = (req, res, next) => {
  res.render("partials/Home", {
    title: "Home",
    layout: "Layout/main",
    isHomePage: true,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
};

const getAbout = (req, res, next) => {
  res.render("partials/About", {
    title: "About",
    layout: "Layout/main",
    isAboutPage: true,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
};

module.exports = { getHome, getAbout };
