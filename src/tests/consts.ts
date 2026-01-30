import Comment from "../types/comment";
import PostInput from "../types/post";
import { UserInput } from "../types/user";

export const POSTS: Omit<PostInput, "sender">[] = [
  {
    title: "Test Post",
    description: "Test Description",
  },
  {
    title: "Another Post",
    description: "Another Description",
  },
];

export const USERS: UserInput[] = [
  {
    email: "example1@example.com",
    username: "example1User",
    password: "example1Pass",
    refreshTokens: [],
  },
  {
    email: "example2@example.com",
    username: "example2User",
    password: "example2Pass",
    refreshTokens: [],
  },
];

export const COMMENTS: Omit<Comment, "sender" | "postId">[] = [
  {
    message: "Test Comment",
  },
  {
    message: "Another Comment",
  },
];
