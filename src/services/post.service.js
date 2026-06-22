import { AppError } from "../utils/errors.js";

export class PostService {
  constructor(postRepository, pubSub) {
    this.postRepository = postRepository;
    this.pubSub = pubSub;
  }

  async createPost({ title, body, authorId }) {
    if (!authorId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const post = await this.postRepository.create({
      title,
      body,
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