import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return null;
  }
}