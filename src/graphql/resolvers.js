import bcrypt from "bcryptjs";
import { signAccessToken } from "../config/jwt.js";
import { DateScalar } from "../utils/scalars/Date.js";
import { AppError } from "../utils/errors.js";

export const resolvers = {
  Date: DateScalar,
  Query: {
    health: () => ({ success: true, message: "ok" }),
    me: async (_parent, _args, context) => {
      if (!context.user?.id) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      return context.userService.profile(context.user.id);
    },
    users: async (_parent, _args, context) => {
      const users = await context.userRepository.list();
      return { success: true, message: "Users loaded", data: users };
    },
    user: async (_parent, { id }, context) => context.userService.profile(id),
    posts: async (_parent, _args, context) => context.postService.listPosts(),
    post: async (_parent, { id }, context) => {
      const post = await context.postRepository.findById(id);
      if (!post) {
        throw new AppError("Post not found", 404, "NOT_FOUND");
      }

      return { success: true, message: "Post loaded", data: post };
    },
  },
  Mutation: {
    register: async (_parent, { input }, context) => context.userService.register(input),
    login: async (_parent, { input }, context) => {
      const user = await context.userRepository.findByEmail(input.email);
      if (!user) {
        throw new AppError("Invalid credentials", 401, "UNAUTHORIZED");
      }

      const isValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValid) {
        throw new AppError("Invalid credentials", 401, "UNAUTHORIZED");
      }

      return {
        token: signAccessToken({ id: user.id, email: user.email, role: user.role }),
        user,
      };
    },
    createPost: async (_parent, { input }, context) =>
      context.postService.createPost({ ...input, authorId: context.user?.id }),
    createComment: async (_parent, { input }, context) =>
      context.commentService.createComment({ ...input, authorId: context.user?.id }),
  },
  Subscription: {
    postCreated: {
      subscribe: (_parent, _args, context) => context.pubSub.asyncIterator("POST_CREATED"),
    },
    commentCreated: {
      subscribe: (_parent, _args, context) => context.pubSub.asyncIterator("COMMENT_CREATED"),
    },
  },
  User: {
    posts: (parent, _args, context) => context.loaders.postsByAuthorId.load(parent.id),
  },
  Post: {
    author: (parent, _args, context) => context.loaders.usersById.load(parent.authorId),
    comments: (parent, _args, context) => context.loaders.commentsByPostId.load(parent.id),
  },
  Comment: {
    author: (parent, _args, context) => context.loaders.usersById.load(parent.authorId),
    post: (parent, _args, context) => context.loaders.postsById.load(parent.postId),
  },
};