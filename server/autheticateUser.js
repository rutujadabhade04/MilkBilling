const jwt = require("jsonwebtoken");
module.exports = function authenticateUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    // This is guest
    req.role = "guest";
    next();
    return; /*Important */
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, tokenData) => {
    if (err && err.name == "TokenExpiredError") {
      //Clear the cookie
      res.clearCookie("token", {
        httpOnly: true, //If true, the cookie cannot be accessed via JavaScript (document.cookie).
        // secure: false, // Set to true in production with HTTPS
        secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
        sameSite: "none",
      });
      res.status(400).json(err);
      return;
    } else if (err) {
      req.role = "Forbidden";
      next();
      res.status(401).json(err);
      return;
    }
    req.tokenData = tokenData;
    next();
  });
};
