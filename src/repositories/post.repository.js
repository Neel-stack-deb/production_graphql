import { prisma } from "../config/prisma.js";

export class PostRepository {
  async findById(id) {
    return prisma.post.findUnique({ where: { id } });
  }

  async findManyByIds(ids) {
    return prisma.post.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findManyByAuthorIds(authorIds) {
    return prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data) {
    return prisma.post.create({ data });
  }

  async list() {
    return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  }
}