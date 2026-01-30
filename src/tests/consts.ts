import { UserInput } from "../types/user";
import Post from "../types/post";
import mongoose from "mongoose";

export const POSTS: Post[] = [
  {
    title: "Test Post",
    description: "Test Description",
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
