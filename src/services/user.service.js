import bcrypt from "bcryptjs";
import { AppError } from "../utils/errors.js";
import { assertEmail, assertStringField } from "../utils/validation.js";

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register({ name, email, password }) {
    const safeName = assertStringField(name, "Name", { minLength: 2 });
    const safeEmail = assertEmail(email);
    const safePassword = assertStringField(password, "Password", { minLength: 8 });

    const existing = await this.userRepository.findByEmail(safeEmail);
    if (existing) {
      throw new AppError("Email already in use", 409, "CONFLICT");
    }

    const passwordHash = await bcrypt.hash(safePassword, 12);
    const user = await this.userRepository.create({
      name: safeName,
      email: safeEmail,
      passwordHash,
      role: "USER",
    });

    return {
      success: true,
      message: "User registered successfully",
      data: user,
    };
  }

  async profile(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    return {
      success: true,
      message: "User profile loaded",
      data: user,
    };
  }
}