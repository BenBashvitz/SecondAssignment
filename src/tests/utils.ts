import { Express } from "express";
import { Model } from "mongoose";
import request from "supertest";
import userModel from "../models/userModel";
import Comment from "../types/comment";
import Tokens from "../types/tokens";
import { USERS } from "./consts";
import TokenPayload from "../types/token";
import jwt from "jsonwebtoken";
import { UserInput } from "../types/user";

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
  await userModel.deleteMany();

  const userTokens: Tokens[] = [];
  const userIds: string[] = [];

  for (let i = 0; i < USERS.length; i++) {
    const token = await getUserToken(app, USERS[i]);
    userTokens.push(token);
  }

  for (const token of userTokens) {
    userIds.push((jwt.decode(token.token) as TokenPayload).userId);
  }

  return { userTokens, userIds };
}

export const getUserToken = async (app: Express, user: UserInput): Promise<Tokens> => {
  const response = await request(app)
    .post("/auth/register")
    .send(user);

  return response.body;
};
