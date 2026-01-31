import { Express } from "express";
import { Model } from "mongoose";
import request from "supertest";
import userModel from "../models/userModel";
import Comment from "../types/comment";
import Tokens from "../types/tokens";
import { USERS } from "./consts";
import TokenPayload from "../types/token";
import jwt from "jsonwebtoken";

export const cleanupBeforeCommentTests = async (
  model: Model<Comment>,
  data: Omit<Comment, "sender" | "postId">[],
  userIds: string[],
  postIds: string[],
) => {
  await model.deleteMany();
  const commentsWithUserAndPost = data.map((comment, index) => ({
    ...comment,
    sender: userIds[index],
    postId: postIds[index],
  }));
  return model.create(commentsWithUserAndPost);
}

export const setupMultipleUsersForTests = async (app: Express) => {
  let userTokens: Tokens[] = [];
  let userIds: string[] = [];

  for (const user of USERS) {
    const token = await getUserToken(app);
    userTokens.push(token);
  }

  userIds = userTokens.map((token) => (jwt.decode(token.token) as TokenPayload).userId);

  return { userTokens, userIds };
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
