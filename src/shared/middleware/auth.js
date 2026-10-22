const jwt = require("jsonwebtoken");
const config = require("../../config");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const user = jwt.verify(token, config.jwt.secret);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const user = jwt.verify(token, config.jwt.secret);
    req.user = user;
  } catch (err) {
    // ignore invalid tokens for optional auth
  }
  next();
}

function requireMfa(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user.mfaVerified) {
    return next();
  }
  return res.status(403).json({ error: "MFA verification required" });
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
  requireMfa,
};
