import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../index";
import movie from "../models/movieModel";
import { User } from "../types/user";
import { MOVIES } from "./consts";
import { getLoggedInUser } from "./utils";

let app: Express;
let loggedInUser: User;

let movieId: string;

beforeAll(async () => {
  app = await initApp();

  await movie.deleteMany();

  loggedInUser = await getLoggedInUser(app);
});

describe("Movie", () => {
  test("movie emptiness", async () => {
    const response = await request(app).get("/movie");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("post movie", async () => {
    for (const movie of MOVIES) {
      const response = await request(app)
        .post("/movie")
        .set("Authorization", `Bearer ${loggedInUser.token}`)
        .send(movie);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(movie);
    }
  });

  test("test get movies after post", async () => {
    const response = await request(app).get("/movie");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(MOVIES.length);
  });

  test("test get movie with filter", async () => {
    const movie = MOVIES[0];

    const response = await request(app).get(`/movie?title=${movie.title}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe(movie.title);

    movieId = response.body[0]._id;
  });

  test("test get movie by id", async () => {
    const response = await request(app).get(`/movie/${movieId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(movieId);
  });

  test("update movie by id", async () => {
    MOVIES[0].releaseYear = 2050;
    MOVIES[0].title = "inceptionUpdated";

    const response = await request(app)
      .put(`/movie/${movieId}`)
      .set("Authorization", `Bearer ${loggedInUser.token}`)
      .send(MOVIES[0]);

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(MOVIES[0].title);
    expect(response.body.releaseYear).toBe(MOVIES[0].releaseYear);
    expect(response.body._id).toBe(movieId);
  });

  test("delete movie by id", async () => {
    const response = await request(app)
      .delete(`/movie/${movieId}`)
      .set("Authorization", `Bearer ${loggedInUser.token}`);
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/movie/${movieId}`);
    expect(getResponse.statusCode).toBe(404);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
