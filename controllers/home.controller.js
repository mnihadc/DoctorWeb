const getHome = (req, res, next) => {
  res.render("partials/Home", {
    title: "Home",
    layout: "Layout/main",
    isHomePage: true,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
};
const getDoctor = (req, res, next) => {
  res.render("partials/Doctor", {
    title: "Doctor",
    layout: "Layout/main",
    isDoctorPage: true,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
};
const Booking = (req, res, next) => {
  doctorName = req.params.doctorName;
  res.render("partials/ViewDoctor", {
    title: `${doctorName} Profile`,
    layout: "Layout/main",
    isViewDoctorPage: true,
    doctorName,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
};
module.exports = { getHome, getDoctor, Booking };
