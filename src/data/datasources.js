import { UserRepository } from "../repositories/user.repository.js";
import { PostRepository } from "../repositories/post.repository.js";
import { CommentRepository } from "../repositories/comment.repository.js";
import { UserService } from "../services/user.service.js";
import { PostService } from "../services/post.service.js";
import { CommentService } from "../services/comment.service.js";
import { getRedisClient } from "../config/redis.js";
import { createPubSub } from "./pubsub.js";

const userRepository = new UserRepository();
const postRepository = new PostRepository();
const commentRepository = new CommentRepository();
const pubSub = createPubSub();
const redis = getRedisClient();

const userService = new UserService(userRepository);
const postService = new PostService(postRepository, pubSub);
const commentService = new CommentService(commentRepository, pubSub);

export function createDataSources() {
  return {
    userRepository,
    postRepository,
    commentRepository,
    userService,
    postService,
    commentService,
    redis,
    pubSub,
  };
}