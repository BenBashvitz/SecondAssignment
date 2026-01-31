import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../index";
import postModel from "../models/postModel";
import { Post } from "../types/post";
import Tokens from "../types/tokens";
import { POSTS } from "./consts";
import { getUserToken } from "./utils";
import jwt from "jsonwebtoken";
import TokenPayload from "../types/token";

let app: Express;
let userTokens: Tokens;
let userId: string;

beforeAll(async () => {
  app = await initApp();

  await postModel.deleteMany();

  userTokens = await getUserToken(app);

  userId = (jwt.decode(userTokens.token) as TokenPayload).userId;
});

describe("Create post", () => {
  test("should create posts", async () => {
    for (const post of POSTS) {
      const response = await request(app)
        .post("/post")
        .set("Authorization", `Bearer ${userTokens.token}`)
        .send(post);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(post);
    }
  });

  it("should fail to create a post with missing required fields", async () => {
    const incompletePost = {
      email: " ",
    };

    const response = await request(app)
      .post("/post")
      .send(incompletePost)
      .set("Authorization", `Bearer ${userTokens.token}`);

    expect(response.status).toBe(500);
  });
});

describe("with post creation", () => {
  let post: Post;

  beforeEach(async () => {
    await postModel.deleteMany();

    const postToInsert = { ...POSTS[0], sender: userId };

    post = (await postModel.create(postToInsert)).toObject();
  });

  describe("Get posts", () => {
    it("should retrieve all posts", async () => {
      const response = await request(app).get("/post");
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    it("should get posts with filter", async () => {
      const response = await request(app).get(`/post?title=${post.title}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe(post.title);
    });

    it("should return empty array if no posts match filter", async () => {
      const response = await request(app).get(
        `/post?title=${post.title}NonExistent`,
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe("Get post by ID", () => {
    it("should get post by id", async () => {
      const response = await request(app).get(`/post/${post._id.toString()}`);
      expect(response.statusCode).toBe(200);
      expect(response.body._id).toBe(post._id.toString());
    });

    it("should return 404 if post not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/post/${nonExistentId}`);
      expect(response.status).toBe(404);
    });
  });

  describe("Update post", () => {
    it("should update post by id", async () => {
      const response = await request(app)
        .put(`/post/${post._id.toString()}`)
        .set("Authorization", `Bearer ${userTokens.token}`)
        .send(POSTS[1]);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(POSTS[1]);
      expect(response.body._id).toBe(post._id.toString());
    });

    it("should return 404 when updating a non-existent post", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put(`/post/${nonExistentId}`)
        .set("Authorization", `Bearer ${userTokens.token}`)
        .send(POSTS[1]);

      expect(response.status).toBe(404);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
