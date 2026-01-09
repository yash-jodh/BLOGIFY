const { validateToken } = require("../services/auth");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];

    // No token → just move on
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {
      // Invalid token → remove cookie
      res.clearCookie(cookieName);
    }

    next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
