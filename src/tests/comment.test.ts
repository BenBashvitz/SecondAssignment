
import request from "supertest";
import initApp from "../index";
import mongoose from "mongoose";
import userModel from "../models/userModel";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";
import { USERS, POSTS } from "./consts";
import { Express } from "express";

let app: Express;
let userId: string;
let postId: string;

beforeAll(async () => {
    app = await initApp();
    await userModel.deleteMany();
    await postModel.deleteMany();
    await commentModel.deleteMany();

    const user = await userModel.create(USERS[0]);
    userId = user._id.toString();

    const post = await postModel.create({
        ...POSTS[0],
        sender: userId,
    });
    postId = post._id.toString();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Create comment", () => {
    it("should create a comment successfully", async () => {
        const commentData = {
            message: "Test Comment",
            sender: userId,
            postId: postId,
        };

        const response = await request(app).post("/comment").send(commentData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(commentData.message);
        expect(response.body.sender).toBe(commentData.sender);
        expect(response.body.postId).toBe(commentData.postId);
    });

    it("should fail to create a comment with missing required fields", async () => {
        const commentData = {
            message: "Test Comment",
        };

        const response = await request(app).post("/comment").send(commentData);

        expect(response.status).toBe(500);
    });
});

describe("Get comments", () => {
    it("should get all comments", async () => {
        const response = await request(app).get("/comment");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});

describe("Update comment", () => {
    let commentId: string;

    beforeEach(async () => {
        await commentModel.deleteMany();
        const comment = await commentModel.create({
            message: "Original Comment",
            sender: userId,
            postId: postId,
        });
        commentId = comment._id.toString();
    });

    it("should update a comment", async () => {
        const updatedData = {
            message: "Updated Comment",
        };

        const response = await request(app)
            .put(`/comment/${commentId}`)
            .send(updatedData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(updatedData.message);
    });

    it("should return 404 when updating a non-existent comment", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const updatedData = {
            message: "Updated Comment",
        };

        const response = await request(app)
            .put(`/comment/${nonExistentId}`)
            .send(updatedData);

        expect(response.status).toBe(404);
    });

    it("should return 500 when updating a comment fails", async () => {
        jest.spyOn(commentModel, "findByIdAndUpdate").mockRejectedValueOnce(new Error("Database error"));

        const updatedData = {
            message: "Updated Comment",
        };

        const response = await request(app)
            .put(`/comment/${commentId}`)
            .send(updatedData);

        expect(response.status).toBe(500);
    });
});

describe("Delete comment", () => {
    let commentId: string;

    beforeEach(async () => {
        await commentModel.deleteMany();
        const comment = await commentModel.create({
            message: "ToDelete Comment",
            sender: userId,
            postId: postId,
        });
        commentId = comment._id.toString();
    });

    it("should delete a comment", async () => {
        const response = await request(app).delete(`/comment/${commentId}`);

        expect(response.status).toBe(200);
    });

    it("should return 404 when deleting a non-existent comment", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const response = await request(app).delete(`/comment/${nonExistentId}`);

        expect(response.status).toBe(404);
    });

    it("should return 500 when deleting a comment fails", async () => {
        jest.spyOn(commentModel, "findByIdAndDelete").mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app).delete(`/comment/${commentId}`);

        expect(response.status).toBe(500);
    });
});
