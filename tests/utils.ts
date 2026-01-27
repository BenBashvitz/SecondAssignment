import request from "supertest";
import { Express } from "express";
import { User } from "../types/user";

export const getLoggedInUser = async (app: Express): Promise<User> => {
  const email = "test@example.com";
  const password = "securePassword123";

  let response = await request(app)
    .post("/auth/register")
    .send({ email, password });

  if (response.statusCode !== 201) {
    response = await request(app).post("/auth/login").send({ email, password });
  }

  return {
    _id: response.body._id,
    email,
    password,
    token: response.body.token,
  };
};
