import { AppError } from "../utils/errors.js";

export class CommentService {
  constructor(commentRepository, pubSub) {
    this.commentRepository = commentRepository;
    this.pubSub = pubSub;
  }

  async createComment({ postId, body, authorId }) {
    if (!authorId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const comment = await this.commentRepository.create({
      postId,
      body,
      authorId,
    });

    await this.pubSub.publish("COMMENT_CREATED", { commentCreated: comment });

    return {
      success: true,
      message: "Comment created successfully",
      data: comment,
    };
  }
}