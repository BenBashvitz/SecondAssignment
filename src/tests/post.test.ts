import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../index";
import postModel from "../models/postModel";
import Tokens from "../types/tokens";
import { POSTS } from "./consts";
import { getUserToken } from "./utils";

let app: Express;
let userTokens: Tokens;

beforeAll(async () => {
  app = await initApp();

  await postModel.deleteMany();

  userTokens = await getUserToken(app);
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
  let postId: string;

  beforeEach(async () => {
    await postModel.deleteMany();

    const postWithSender = { ...POSTS[0], sender: userId };

    const response = await postModel.create(postWithSender);

    postId = response._id;
  });

  describe("Get posts", () => {
    it("should retrieve all posts", async () => {
      const response = await request(app).get("/post");
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    it("should get posts with filter", async () => {
      const response = await request(app).get(`/post?title=${POSTS[0].title}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe(POSTS[0].title);
    });

    it("should return empty array if no posts match filter", async () => {
      const response = await request(app).get(
        `/post?title=${POSTS[0].title}NonExistent`,
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe("Get post by ID", () => {
    it("should get post by id", async () => {
      const response = await request(app).get(`/post/${postId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body._id).toBe(postId);
    });

    it("should return 404 if post not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/post/${nonExistentId}`);
      expect(response.status).toBe(404);
    });
  });

  describe("Update post", () => {
    it("should update post by id", async () => {
      POSTS[0].description = POSTS[0].description + " Updated";
      POSTS[0].title = POSTS[0].title + " Updated";
      POSTS[0].sender = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/post/${postId}`)
        .set("Authorization", `Bearer ${userTokens.token}`)
        .send(POSTS[0]);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject(POSTS[0]);
      expect(response.body._id).toBe(postId);
    });

    it("should return 404 when updating a non-existent post", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .put(`/post/${nonExistentId}`)
        .set("Authorization", `Bearer ${userTokens.token}`)
        .send(POSTS[0]);

      expect(response.status).toBe(404);
    });

    describe("Delete post", () => {
      it("should delete post by id", async () => {
        const response = await request(app)
          .delete(`/post/${postId}`)
          .set("Authorization", `Bearer ${userTokens.token}`);

        expect(response.statusCode).toBe(200);

        const getResponse = await request(app).get(`/post/${postId}`);

        expect(getResponse.statusCode).toBe(404);
      });

      it("should return 404 when deleting a non-existent post", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app)
          .delete(`/post/${nonExistentId}`)
          .set("Authorization", `Bearer ${userTokens.token}`);

        expect(response.status).toBe(404);
      });
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
