import { UserInput } from "../types/user";
import Post from "../types/post";
import Comment from "../types/comment";
import mongoose from "mongoose";

export const POSTS: Post[] = [
  {
    title: "Test Post",
    description: "Test Description",
    sender: new mongoose.Types.ObjectId(),
  },
  {
    title: "Another Post",
    description: "Another Description",
    sender: new mongoose.Types.ObjectId(),
  },
];

export const USERS: UserInput[] = [
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

export const COMMENTS: Comment[] = [
  {
    message: "Test Comment",
    sender: new mongoose.Types.ObjectId(),
    postId: new mongoose.Types.ObjectId(),
  },
  {
    message: "Another Comment",
    sender: new mongoose.Types.ObjectId(),
    postId: new mongoose.Types.ObjectId(),
  },
];

