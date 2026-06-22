import { prisma } from "../config/prisma.js";

export class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findManyByIds(ids) {
    return prisma.user.findMany({
      where: { id: { in: ids } },
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data) {
    return prisma.user.create({ data });
  }

  async list() {
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  }
}