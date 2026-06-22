import { AppError } from "./errors.js";

export function assertStringField(value, fieldName, { minLength = 1 } = {}) {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw new AppError(`${fieldName} is required`, 400, "BAD_USER_INPUT");
  }

  return value.trim();
}

export function assertEmail(value) {
  const email = assertStringField(value, "Email");
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new AppError("Email is invalid", 400, "BAD_USER_INPUT");
  }

  return email.toLowerCase();
}