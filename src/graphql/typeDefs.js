export const typeDefs = `#graphql
  scalar Date

  type ApiResponse {
    success: Boolean!
    message: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: Date!
    updatedAt: Date!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    createdAt: Date!
    updatedAt: Date!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    body: String!
    createdAt: Date!
    updatedAt: Date!
    author: User!
    post: Post!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type UserResponse {
    success: Boolean!
    message: String!
    data: User
  }

  type PostResponse {
    success: Boolean!
    message: String!
    data: Post
  }

  type CommentResponse {
    success: Boolean!
    message: String!
    data: Comment
  }

  type PostsResponse {
    success: Boolean!
    message: String!
    data: [Post!]!
  }

  type UsersResponse {
    success: Boolean!
    message: String!
    data: [User!]!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreatePostInput {
    title: String!
    body: String!
  }

  input CreateCommentInput {
    postId: ID!
    body: String!
  }

  type Query {
    health: ApiResponse!
    me: UserResponse!
    users: UsersResponse!
    user(id: ID!): UserResponse!
    posts: PostsResponse!
    post(id: ID!): PostResponse!
  }

  type Mutation {
    register(input: RegisterInput!): UserResponse!
    login(input: LoginInput!): AuthPayload!
    createPost(input: CreatePostInput!): PostResponse!
    createComment(input: CreateCommentInput!): CommentResponse!
  }

  type Subscription {
    postCreated: Post!
    commentCreated: Comment!
  }
`;