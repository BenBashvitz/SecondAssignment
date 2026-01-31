import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../index";
import authModel from "../models/userModel";
import Tokens from "../types/tokens";
import { COMMENTS, POSTS, USERS } from "./consts";
import { cleanupBeforeCommentTests, getUserToken, setupMultipleUsersForTests } from "./utils";
import jwt from "jsonwebtoken";
import TokenPayload from "../types/token";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await authModel.deleteMany();
});

describe("user registration", () => {
  test("should register user", async () => {
    const response = await request(app).post("/auth/register").send({
      email: USERS[0].email,
      password: USERS[0].password,
      username: USERS[0].username,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");
  });
});

describe("user login", () => {
  test("should login user", async () => {
    const response = await request(app).post("/auth/login").send(USERS[0]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});

describe("Operations with accesses token", () => {
  let userTokens: Tokens[] = [];
  let userIds: string[] = [];

  beforeEach(async () => {
    await authModel.deleteMany();
    const userData = await setupMultipleUsersForTests(app);
    userTokens = userData.userTokens;
    userIds = userData.userIds;
  });

  describe("Post", () => {
    test("should fail to create a post without a token", async () => {
      const response = await request(app).post("/post").send(POSTS[0]);

      expect(response.statusCode).toBe(401);
    });

    test("should create a post with a token", async () => {
      const response = await request(app)
        .post("/post")
        .set("Authorization", `Bearer ${userTokens[0].token}`)
        .send(POSTS[0]);

      expect(response.statusCode).toBe(201);
    });

    test("should fail to create a post with invalid token", async () => {
      const invalidToken = userTokens[0].token + "a";

      const response = await request(app)
        .post("/post")
        .set("Authorization", `Bearer ${invalidToken}`)
        .send(POSTS[0]);

      expect(response.statusCode).toBe(401);
    });

    test("should fail to create a post with expired token", async () => {
      await new Promise((r) => setTimeout(r, 5000));

      const response = await request(app)
        .post("/post")
        .set("Authorization", `Bearer ${userTokens[0].token}`)
        .send(POSTS[0]);

      expect(response.statusCode).toBe(401);
    }, 10000);
  });

  describe("Comment", () => {
    let postIds: string[] = [];

    beforeEach(async () => {
      await postModel.deleteMany();
      const postsWithSenderId = POSTS.map((post, index) => ({
        ...post,
        sender: userIds[index]
      }));

      const posts = await postModel.create(postsWithSenderId);
      postIds = posts.map(post => post._id.toString());
    });

    test("should fail to create a comment without a token", async () => {
      const response = await request(app).post("/comment").send({
        ...COMMENTS[0],
        postId: postIds[0],
      });

      expect(response.statusCode).toBe(401);
    });

    test("should create a comment with a token", async () => {
      const response = await request(app)
        .post("/comment")
        .set("Authorization", `Bearer ${userTokens[0].token}`)
        .send({
          ...COMMENTS[0],
          postId: postIds[0],
        });

      expect(response.statusCode).toBe(201);
    });

    test("should fail to create a comment with invalid token", async () => {
      const invalidToken = userTokens[0].token + "a";

      const response = await request(app)
        .post("/comment")
        .set("Authorization", `Bearer ${invalidToken}`)
        .send({
          ...COMMENTS[0],
          postId: postIds[0],
        });

      expect(response.statusCode).toBe(401);
    });

    test("should fail to create a comment with expired token", async () => {
      await new Promise((r) => setTimeout(r, 5000));

      const response = await request(app)
        .post("/comment")
        .set("Authorization", `Bearer ${userTokens[0].token}`)
        .send({
          ...COMMENTS[0],
          postId: postIds[0],
        });

      expect(response.statusCode).toBe(401);
    }, 10000);


    test("should fail to update a comment by another user", async () => {
      const comments = await cleanupBeforeCommentTests(commentModel, [COMMENTS[0]], userIds, postIds);
      const commentId = comments[0]._id.toString();
      const updatedData = {
        ...COMMENTS[1],
        postId: postIds[1],
        sender: userIds[1],
      };

      const response = await request(app)
        .put(`/comment/${commentId}`)
        .set("Authorization", `Bearer ${userTokens[1].token}`)
        .send(updatedData);

      expect(response.status).toBe(403);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
