import { verifyAccessToken } from "./jwt.js";

export function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  req.token = token;
  req.user = token ? verifyAccessToken(token) : null;
  next();
}