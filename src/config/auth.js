import { AppError } from "../utils/errors.js";
import { verifyAccessToken } from "./jwt.js";

export function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  req.token = token;
  req.user = token ? verifyAccessToken(token) : null;
  next();
}

export function requireAuth(context) {
  if (!context.user?.id) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  return context.user;
}

export function requireRole(context, allowedRoles) {
  const user = requireAuth(context);

  if (!allowedRoles.includes(user.role)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  return user;
}