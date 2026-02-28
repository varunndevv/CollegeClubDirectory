import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  console.error("CRITICAL ERROR: JWT_SECRET environment variable is not defined.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;/**
 * Sign a JWT token for a user.
 */
export function signToken(user) {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Middleware: require a valid JWT in the `auth_token` cookie.
 * Attaches `req.user` with { id, email, role, assignedClubId }.
 */
export function requireAuth(req, res, next) {
  const token =
    req.cookies?.auth_token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware: require user to have one of the given roles.
 * Must be used AFTER requireAuth.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export { JWT_SECRET };
