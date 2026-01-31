import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../index";
import userModel from "../models/userModel";
import Tokens from "../types/tokens";
import { COMMENTS, POSTS, POSTS, USERS } from "./consts";
import { getUserToken } from "./utils";
import jwt from "jsonwebtoken";
import TokenPayload from "../types/token";

let app: Express;
let tokens: Tokens;
let userId: string;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany();

  tokens = await getUserToken(app);
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
  beforeEach(async () => {
    await userModel.deleteMany();

    const response = await request(app).post("/auth/register").send({
      email: USERS[0].email,
      password: USERS[0].password,
      username: USERS[0].username,
    });

    tokens = {
      token: response.body.token,
      refreshToken: response.body.refreshToken,
    };
  });

  describe("Post", () => {
    test("should fail to create a post without a token", async () => {
      const response = await request(app).post("/post").send(POSTS[0]);

      expect(response.statusCode).toBe(401);
    });

    test("should create a post with a token", async () => {
      const response = await request(app)
        .post("/post")
        .set("Authorization", `Bearer ${tokens.token}`)
        .send(POSTS[0]);

      expect(response.statusCode).toBe(201);
    });

    test("should fail to create a post with invalid token", async () => {
      const invalidToken = tokens.token + "a";

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
        .set("Authorization", `Bearer ${tokens.token}`)
        .send(POSTS[0]);

      expect(response.statusCode).toBe(401);
    }, 10000);
  });

  describe("Comment", () => {
    test("should fail to create a comment without a token", async () => {
      const response = await request(app).post("/comment").send(COMMENTS[0]);

      expect(response.statusCode).toBe(401);
    });

    test("should create a comment with a token", async () => {
      const response = await request(app)
        .post("/comment")
        .set("Authorization", `Bearer ${tokens.token}`)
        .send(COMMENTS[0]);

      expect(response.statusCode).toBe(201);
    });

    test("should fail to create a comment with invalid token", async () => {
      const invalidToken = tokens.token + "a";

      const response = await request(app)
        .post("/comment")
        .set("Authorization", `Bearer ${invalidToken}`)
        .send(COMMENTS[0]);

      expect(response.statusCode).toBe(401);
    });

    test("should fail to create a comment with expired token", async () => {
      await new Promise((r) => setTimeout(r, 5000));

      const response = await request(app)
        .post("/comment")
        .set("Authorization", `Bearer ${tokens.token}`)
        .send(COMMENTS[0]);

      expect(response.statusCode).toBe(401);
    }, 10000);
  });
});

describe("Refresh token", () => {
  it("should fail to create a post with expired token", async () => {
    await new Promise((r) => setTimeout(r, 5000));

    const response = await request(app)
      .post("/post")
      .set("Authorization", `Bearer ${tokens.token}`)
      .send(POSTS[0]);
    expect(response.statusCode).toBe(401);

    const refreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: tokens.refreshToken,
      });

    expect(refreshTokenResponse.statusCode).toBe(200);
    expect(refreshTokenResponse.body).toHaveProperty("token");
    expect(refreshTokenResponse.body).toHaveProperty("refreshToken");

    tokens.token = refreshTokenResponse.body.token;
    tokens.refreshToken = refreshTokenResponse.body.refreshToken;

    const newPostResponse = await request(app)
      .post("/post")
      .send(POSTS[1])
      .set("Authorization", `Bearer ${tokens.token}`);

    expect(newPostResponse.statusCode).toBe(201);
    expect(newPostResponse.body).toMatchObject(POSTS[1]);
  }, 10000);

  it("should fail to refresh token with double use", async () => {
    await new Promise((r) => setTimeout(r, 1000));

    const refreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: tokens.refreshToken,
      });

    expect(refreshTokenResponse.statusCode).toBe(200);
    expect(refreshTokenResponse.body).toHaveProperty("token");
    expect(refreshTokenResponse.body).toHaveProperty("refreshToken");

    const newRefreshToken = refreshTokenResponse.body.refreshToken;

    const secondRefreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: tokens.refreshToken,
      });

    expect(secondRefreshTokenResponse.statusCode).toBe(401);
    expect(secondRefreshTokenResponse.body).toHaveProperty("error");

    const thirdRefreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: newRefreshToken,
      });

    expect(thirdRefreshTokenResponse.statusCode).toBe(401);
    expect(thirdRefreshTokenResponse.body).toHaveProperty("error");
  });
})

afterAll(async () => {
  await mongoose.connection.close();
});
