import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../index";
import userModel from "../models/userModel";
import Tokens from "../types/tokens";
import { COMMENTS, POSTS, USERS } from "./consts";
import { cleanupBeforeCommentTests, setupMultipleUsersForTests } from "./utils";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany();
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

describe("Refresh token", () => {
  let userTokens: Tokens[] = [];
  let userIds: string[] = [];

  beforeEach(async () => {
    const userData = await setupMultipleUsersForTests(app);
    userTokens = userData.userTokens;
    userIds = userData.userIds;
  });

  it("should fail to create a post with expired token", async () => {
    await new Promise((r) => setTimeout(r, 5000));

    const response = await request(app)
      .post("/post")
      .set("Authorization", `Bearer ${userTokens[0].token}`)
      .send(POSTS[0]);
    expect(response.statusCode).toBe(401);

    const refreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: userTokens[0].refreshToken,
      });

    expect(refreshTokenResponse.statusCode).toBe(200);
    expect(refreshTokenResponse.body.token).not.toBeNull();
    expect(refreshTokenResponse.body.refreshToken).not.toBeNull();

    userTokens[0].token = refreshTokenResponse.body.token;
    userTokens[0].refreshToken = refreshTokenResponse.body.refreshToken;

    const newPostResponse = await request(app)
      .post("/post")
      .send(POSTS[1])
      .set("Authorization", `Bearer ${userTokens[0].token}`);

    expect(newPostResponse.statusCode).toBe(201);
    expect(newPostResponse.body).toMatchObject(POSTS[1]);
    expect(newPostResponse.body.sender).toBe(userIds[0]);

  }, 10000);

  it("should fail to refresh token with double use", async () => {
    await new Promise((r) => setTimeout(r, 1000));

    const refreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: userTokens[0].refreshToken,
      });

    expect(refreshTokenResponse.statusCode).toBe(200);
    expect(refreshTokenResponse.body.token).not.toBeNull();
    expect(refreshTokenResponse.body.refreshToken).not.toBeNull();

    const newRefreshToken = refreshTokenResponse.body.refreshToken;

    const secondRefreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: userTokens[0].refreshToken,
      });

    expect(secondRefreshTokenResponse.statusCode).toBe(401);

    const thirdRefreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: newRefreshToken,
      });

    expect(thirdRefreshTokenResponse.statusCode).toBe(401);
  });
})

afterAll(async () => {
  await mongoose.connection.close();
});
