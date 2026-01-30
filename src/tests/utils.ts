import { Express } from "express";
import { Model } from "mongoose";
import request from "supertest";
import userModel from "../models/userModel";
import Comment from "../types/comment";
import Tokens from "../types/tokens";

export async function cleanupBeforeCommentTests(
  model: Model<Comment>,
  data: Omit<Comment, "sender" | "postId">[],
  userIds: string[],
  postIds: string[],
) {
  await model.deleteMany();
  const commentsWithUserAndPost = data.map((comment, index) => ({
    ...comment,
    sender: userIds[index],
    postId: postIds[index],
  }));
  return model.create(commentsWithUserAndPost);
}

export const getUserToken = async (app: Express): Promise<Tokens> => {
  const email = "test@example.com";
  const password = "securePassword123";
  const username = "testuser";

  await userModel.deleteMany();

  const response = await request(app)
    .post("/auth/register")
    .send({ email, password, username });

  return response.body;
};
