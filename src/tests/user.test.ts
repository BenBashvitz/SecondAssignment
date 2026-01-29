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

describe("Create user", () => {
  it("should create and save a user successfully", async () => {
    for (const user of USERS) {
      const response = await request(app).post("/user").send(user);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(user);
    }
  });

  it("should fail to create a user with missing required fields", async () => {
    const incompleteUser = {
      email: " ",
    };

    const response = await request(app).post("/user").send(incompleteUser);

    expect(response.status).toBe(500);
  });
});

describe("Get users", () => {
  it("should retrieve all users", async () => {
    const response = await request(app).get("/user");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(USERS.length);
  });
});

describe("Update user", () => {
  let userId: string;

  beforeEach(async () => {
    await userModel.deleteMany();
    const user = await userModel.create(USERS[0]);
    userId = user._id.toString();
  });

  it("should update a user successfully and return 201", async () => {
    const updatedData = {
      username: "updatedUser",
      email: "updatedEmail",
      password: "updatedPassword",
    };
    const response = await request(app)
      .put(`/user/${userId}`)
      .send(updatedData);

    expect(response.status).toBe(201);
    expect(response.body.username).toBe(updatedData.username);
  });

  it("should return 404 if user not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updatedData = {
      username: "updatedUser",
      email: "updatedEmail",
      password: "updatedPassword",
    };
    const response = await request(app)
      .put(`/user/${nonExistentId}`)
      .send(updatedData);

    expect(response.status).toBe(404);
  });

  it("should return 500 if an error occurs", async () => {
    jest
      .spyOn(userModel, "findByIdAndUpdate")
      .mockRejectedValueOnce(new Error("Database error"));

    const updatedData = {
      username: "updatedUser",
      email: "updatedEmail",
      password: "updatedPassword",
    };
    const response = await request(app)
      .put(`/user/${userId}`)
      .send(updatedData);

    expect(response.status).toBe(500);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
