import test from "node:test";
import assert from "node:assert/strict";

import { AppError } from "../src/utils/errors.js";
import { assertEmail, assertStringField } from "../src/utils/validation.js";
import { requireAuth, requireRole } from "../src/config/auth.js";
import { UserService } from "../src/services/user.service.js";
import { PostService } from "../src/services/post.service.js";
import { CommentService } from "../src/services/comment.service.js";

test("assertStringField trims valid input", () => {
  assert.equal(assertStringField("  hello  ", "Value"), "hello");
});

test("assertStringField rejects invalid input", () => {
  assert.throws(() => assertStringField("", "Value"), AppError);
});

test("assertEmail normalizes email casing", () => {
  assert.equal(assertEmail("Test@Example.Com"), "test@example.com");
});

test("requireAuth returns authenticated user", () => {
  const user = { id: "user-1", role: "USER" };
  assert.equal(requireAuth({ user }), user);
});

test("requireRole blocks missing privileges", () => {
  assert.throws(() => requireRole({ user: { id: "user-1", role: "USER" } }, ["ADMIN"]), AppError);
});

test("UserService.register validates and persists a new user", async () => {
  const createdUser = { id: "user-1", name: "Ada", email: "ada@example.com" };
  const userRepository = {
    findByEmail: async () => null,
    create: async (data) => ({ ...createdUser, ...data }),
  };

  const userService = new UserService(userRepository);
  const result = await userService.register({
    name: "Ada Lovelace",
    email: "ADA@EXAMPLE.COM",
    password: "password123",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, "ada@example.com");
  assert.equal(result.data.name, "Ada Lovelace");
});

test("UserService.logout increments token version", async () => {
  let updatedData = null;
  const userRepository = {
    findByEmail: async () => null,
    create: async () => null,
    updateById: async (id, data) => {
      updatedData = { id, data };
      return { id, tokenVersion: 1 };
    },
  };

  const userService = new UserService(userRepository);
  const result = await userService.logout("user-1");

  assert.equal(result.success, true);
  assert.deepEqual(updatedData, {
    id: "user-1",
    data: { tokenVersion: { increment: 1 } },
  });
});

test("PostService.createPost publishes a post event", async () => {
  let published = null;
  const postRepository = {
    create: async (data) => ({ id: "post-1", ...data }),
    list: async () => [],
  };
  const pubSub = {
    publish: async (trigger, payload) => {
      published = { trigger, payload };
    },
  };

  const postService = new PostService(postRepository, pubSub);
  const result = await postService.createPost({
    title: "Production ready post",
    body: "This is a sufficiently long post body.",
    authorId: "user-1",
  });

  assert.equal(result.success, true);
  assert.deepEqual(published, {
    trigger: "POST_CREATED",
    payload: { postCreated: result.data },
  });
});

test("CommentService.createComment publishes a comment event", async () => {
  let published = null;
  const commentRepository = {
    create: async (data) => ({ id: "comment-1", ...data }),
  };
  const pubSub = {
    publish: async (trigger, payload) => {
      published = { trigger, payload };
    },
  };

  const commentService = new CommentService(commentRepository, pubSub);
  const result = await commentService.createComment({
    postId: "post-1",
    body: "Nice post",
    authorId: "user-1",
  });

  assert.equal(result.success, true);
  assert.deepEqual(published, {
    trigger: "COMMENT_CREATED",
    payload: { commentCreated: result.data },
  });
});