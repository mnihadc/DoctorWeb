function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.redirect("/auth/login");
  }
}

module.exports = { isAdmin };
