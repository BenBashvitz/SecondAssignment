import mongoose from "mongoose";
import initApp from "../index";
import userModel from "../models/userModel";
import request from "supertest";
import { Express } from "express";
import { USERS } from "./consts";

let app: Express;

beforeAll(async () => {
  app = await initApp();

  await userModel.deleteMany();
});

describe("User Model Test Suite", () => {
  it("should create and save a user successfully", async () => {
    for (const user of USERS) {
      const response = await request(app).post("/user").send(user);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(user);
    }
  });

  it("should retrieve all users", async () => {
    const response = await request(app).get("/user");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(USERS.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
