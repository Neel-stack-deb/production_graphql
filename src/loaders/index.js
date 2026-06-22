import DataLoader from "dataloader";

export function createLoaders({ userRepository, postRepository, commentRepository }) {
  const postsByAuthorId = new DataLoader(async (authorIds) => {
    const posts = await postRepository.findManyByAuthorIds(authorIds);
    return authorIds.map((authorId) => posts.filter((post) => post.authorId === authorId));
  });

  const postsById = new DataLoader(async (postIds) => {
    const posts = await postRepository.findManyByIds(postIds);
    return postIds.map((postId) => posts.find((post) => post.id === postId) ?? null);
  });

  const commentsByPostId = new DataLoader(async (postIds) => {
    const comments = await commentRepository.findManyByPostIds(postIds);
    return postIds.map((postId) => comments.filter((comment) => comment.postId === postId));
  });

  const usersById = new DataLoader(async (userIds) => {
    const users = await userRepository.findManyByIds(userIds);
    return userIds.map((userId) => users.find((user) => user.id === userId) ?? null);
  });

  return {
    usersById,
    postsById,
    postsByAuthorId,
    commentsByPostId,
  };
}