const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect("/auth/login");
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.redirect("/auth/login");
    }
    req.user = user;
    next();
  });
};

module.exports = verifyToken;
