import User from "../types/user";
import Post from "../types/post";

export const POSTS: Post[] = [
  {
    title: "Test Post",
    description: "Test Description",
    sender: "testSenderId",
  },
];

export const USERS: User[] = [
  {
    email: "example1@example.com",
    username: "example1User",
    password: "example1Pass",
  },
  {
    email: "example2@example.com",
    username: "example2User",
    password: "example2Pass",
  },
];
