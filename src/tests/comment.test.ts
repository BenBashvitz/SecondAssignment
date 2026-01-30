
import request from "supertest";
import initApp from "../index";
import mongoose from "mongoose";
import userModel from "../models/userModel";
import postModel from "../models/postModel";
import commentModel from "../models/commentModel";
import { USERS, POSTS, COMMENTS } from "./consts";
import { Express } from "express";

let app: Express;
let userIds: string[];
let postIds: string[];

beforeAll(async () => {
    app = await initApp();
    await userModel.deleteMany();
    await postModel.deleteMany();

    const users = await userModel.create(USERS);
    userIds = users.map((user) => user._id.toString());
    const postsWithSenderId = POSTS.map((post, index) => ({
        ...post,
        sender: userIds[index]
    }));

    const posts = await postModel.create(postsWithSenderId);
    postIds = posts.map(post => post._id.toString());
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Create comment", () => {
    it("should create a comment successfully", async () => {
        const commentData = {
            ...COMMENTS[0],
            sender: userIds[0],
            postId: postIds[0],
        };

        const response = await request(app).post("/comment").send(commentData);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(commentData);
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
    beforeEach(async () => {
        await commentModel.deleteMany();
        const commentsWithSenderId = COMMENTS.map((comment, index) => ({
            ...comment,
            sender: userIds[index],
            postId: postIds[index],
        }));
        await commentModel.create(commentsWithSenderId);
    });

    it("should get all comments", async () => {
        const response = await request(app).get("/comment");

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(COMMENTS.length);
    });
});

describe("Update comment", () => {
    let commentId: string;

    beforeEach(async () => {
        await commentModel.deleteMany();
        const comment = await commentModel.create({
            ...COMMENTS[0],
            sender: userIds[0],
            postId: postIds[0],
        });
        commentId = comment._id.toString();
    });

    it("should update a comment", async () => {
        const updatedData = {
            ...COMMENTS[1],
            sender: userIds[1],
            postId: postIds[1],
        };

        const response = await request(app)
            .put(`/comment/${commentId}`)
            .send(updatedData);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(updatedData);
    });

    it("should return 404 when updating a non-existent comment", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const updatedData = {
            ...COMMENTS[1],
            sender: userIds[1],
            postId: postIds[1],
        };

        const response = await request(app)
            .put(`/comment/${nonExistentId}`)
            .send(updatedData);

        expect(response.status).toBe(404);
    });

    it("should return 500 when updating a comment fails", async () => {
        jest.spyOn(commentModel, "findByIdAndUpdate").mockRejectedValueOnce(new Error("Database error"));

        const updatedData = {
            ...COMMENTS[1],
            sender: userIds[1],
            postId: postIds[1],
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
            ...COMMENTS[0],
            sender: userIds[0],
            postId: postIds[0],
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
