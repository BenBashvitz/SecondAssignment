import mongoose from "mongoose";
import initApp from "../index";
import userModel from "../models/userModel";
import request from "supertest";
import { Express } from "express";
import { USERS } from "./consts";
import { User } from "../types/user";

let app: Express;
let user: User;

beforeAll(async () => {
  app = await initApp();

  await userModel.deleteMany();
});

describe("User Model Test Suite", () => {
  test("User emptiness", async () => {
    const response = await request(app).get("/user");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("Create and save a user successfully", async () => {
    for (const user of USERS) {
      const response = await request(app).post("/user").send(user);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(user);
    }
  });

  it("Get all users", async () => {
    const response = await request(app).get("/user");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(USERS.length);

    user = response.body[0];
  });

  it("Get user by ID", async () => {
    const response = await request(app).get(`/user/${user._id}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(user);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
