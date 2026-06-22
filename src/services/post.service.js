import { AppError } from "../utils/errors.js";
import { assertStringField } from "../utils/validation.js";

export class PostService {
  constructor(postRepository, pubSub) {
    this.postRepository = postRepository;
    this.pubSub = pubSub;
  }

  async createPost({ title, body, authorId }) {
    const safeTitle = assertStringField(title, "Title", { minLength: 3 });
    const safeBody = assertStringField(body, "Body", { minLength: 10 });

    if (!authorId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const post = await this.postRepository.create({
      title: safeTitle,
      body: safeBody,
      authorId,
    });

    await this.pubSub.publish("POST_CREATED", { postCreated: post });

    return {
      success: true,
      message: "Post created successfully",
      data: post,
    };
  }

  async listPosts() {
    const posts = await this.postRepository.list();
    return {
      success: true,
      message: "Posts loaded",
      data: posts,
    };
  }
}