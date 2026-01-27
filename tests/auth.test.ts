import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../index";
import authModel from "../models/userModel";
import { User } from "../types/user";
import { MOVIES } from "./consts";

let app: Express;

const userData: User = {
  email: "test@example.com",
  password: "password123",
};

beforeAll(async () => {
  app = await initApp();

  await authModel.deleteMany();
});

describe("Auth", () => {
  test("create a movie without token fail", async () => {
    const response = await request(app).post("/movie").send(MOVIES[0]);
    expect(response.statusCode).toBe(401);
  });

  test("Register", async () => {
    const response = await request(app).post("/auth/register").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");

    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
    userData._id = response.body._id;
  });

  test("movie creation with token succeed", async () => {
    const response = await request(app)
      .post("/movie")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(MOVIES[0]);
    expect(response.statusCode).toBe(201);
  });

  test("create a movie with invalid token fail", async () => {
    const invalidToken = userData.token + "a";

    const response = await request(app)
      .post("/movie")
      .set("Authorization", `Bearer ${invalidToken}`)
      .send(MOVIES[0]);
    expect(response.statusCode).toBe(401);
  });

  test("Login", async () => {
    await new Promise((r) => setTimeout(r, 1000));

    const response = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");
    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
  });

  test("create a movie with expired token fail", async () => {
    await new Promise((r) => setTimeout(r, 5000));

    const response = await request(app)
      .post("/movie")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(MOVIES[0]);
    expect(response.statusCode).toBe(401);

    const refreshTokenResponse = await request(app)
      .post("/auth/refresh-token")
      .send({
        refreshToken: userData.refreshToken,
      });

    expect(refreshTokenResponse.statusCode).toBe(200);
    expect(refreshTokenResponse.body).toHaveProperty("token");
    expect(refreshTokenResponse.body).toHaveProperty("refreshToken");

    userData.token = refreshTokenResponse.body.token;
    userData.refreshToken = refreshTokenResponse.body.refreshToken;

    const newMovieResponse = await request(app)
      .post("/movie")
      .send(MOVIES[1])
      .set("Authorization", `Bearer ${userData.token}`);

    expect(newMovieResponse.statusCode).toBe(201);
    expect(newMovieResponse.body).toMatchObject(MOVIES[1]);
  }, 10000);
});

test("test double use of refresh token", async () => {
  await new Promise((r) => setTimeout(r, 1000));

  const refreshTokenResponse = await request(app)
    .post("/auth/refresh-token")
    .send({
      refreshToken: userData.refreshToken,
    });

  expect(refreshTokenResponse.statusCode).toBe(200);
  expect(refreshTokenResponse.body).toHaveProperty("token");
  expect(refreshTokenResponse.body).toHaveProperty("refreshToken");

  const newRefreshToken = refreshTokenResponse.body.refreshToken;

  const secondRefreshTokenResponse = await request(app)
    .post("/auth/refresh-token")
    .send({
      refreshToken: userData.refreshToken,
    });

  // console.log("userData.refreshToken", userData.refreshToken);
  // console.log(
  //   "secondRefreshTokenResponse.body ",
  //   secondRefreshTokenResponse.body
  // );

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

afterAll(async () => {
  await mongoose.connection.close();
});
