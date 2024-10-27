const getLogin = (req, res, next) => {
  res.render("partials/Login", {
    title: "Login",
    layout: "Layout/main",
    isLoginPage: true,
  });
};

module.exports = { getLogin };
