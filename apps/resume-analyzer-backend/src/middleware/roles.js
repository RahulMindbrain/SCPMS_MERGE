const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied for your role" });
    }
    next();
  };
};

module.exports = authorize;