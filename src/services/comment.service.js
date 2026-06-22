import { AppError } from "../utils/errors.js";
import { assertStringField } from "../utils/validation.js";

export class CommentService {
  constructor(commentRepository, pubSub) {
    this.commentRepository = commentRepository;
    this.pubSub = pubSub;
  }

  async createComment({ postId, body, authorId }) {
    const safeBody = assertStringField(body, "Body", { minLength: 2 });

    if (!authorId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const comment = await this.commentRepository.create({
      postId,
      body: safeBody,
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