import request from "supertest";
import initApp from "../index";
import mongoose from "mongoose";
import commentModel from "../models/commentModel";
import { Express } from "express";
import Comment from "../types/comment";

let app: Express;

const COMMENTS: Comment[] = [
  {
    message: "The first comment",
    movieId: "1",
    userId: "2",
  },
  {
    message: "The first comment",
    movieId: "2",
    userId: "1",
  },
  {
    message: "The first comment",
    movieId: "3",
    userId: "3",
  },
  {
    message: "The second comment",
    movieId: "3",
    userId: "3",
  },
];

beforeAll(async () => {
  app = await initApp();

  await commentModel.deleteMany();
});

describe("Comment", () => {
  test("Post comment", async () => {
    for (const comment of COMMENTS) {
      const response = await request(app).post("/comment").send(comment);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(comment);
    }
  });

  test("Get comments after post", async () => {
    const response = await request(app).get("/comment");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(COMMENTS.length);
  });

  test("Get comments By movieId", async () => {
    const comment = COMMENTS[0];

    const response = await request(app).get(
      `/comment?movieId=${comment.movieId}`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].message).toBe(comment.message);

    COMMENTS[0]._id = response.body[0]._id;
  });

  test("Get comment by id", async () => {
    const response = await request(app).get(`/comment/${COMMENTS[0]._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(COMMENTS[0].message);
    expect(response.body.movieId).toBe(COMMENTS[0].movieId);
    expect(response.body._id).toBe(COMMENTS[0]._id);
  });

  test("Update comment by id", async () => {
    COMMENTS[0].message = "updated comment";
    COMMENTS[0].movieId = "4444";

    const response = await request(app)
      .put(`/comment/${COMMENTS[0]._id}`)
      .send(COMMENTS[0]);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe(COMMENTS[0].message);
    expect(response.body.movieId).toBe(COMMENTS[0].movieId);
    expect(response.body._id).toBe(COMMENTS[0]._id);
  });

  test("Delete comment by id", async () => {
    const response = await request(app).delete(`/comment/${COMMENTS[0]._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(COMMENTS[0]._id);

    const getResponse = await request(app).get(`/comment/${COMMENTS[0]._id}`);
    expect(getResponse.statusCode).toBe(404);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
