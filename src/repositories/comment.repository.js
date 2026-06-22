import { prisma } from "../config/prisma.js";

export class CommentRepository {
  async findManyByPostIds(postIds) {
    return prisma.comment.findMany({
      where: { postId: { in: postIds } },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(data) {
    return prisma.comment.create({ data });
  }
}