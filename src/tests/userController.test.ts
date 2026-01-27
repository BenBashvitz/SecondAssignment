import request from "supertest";
import express from "express";
import userController from "../controllers/userController";
import userModel from "../models/userModel";
import mongoose from "mongoose";

// Mock the userModel
jest.mock("../models/userModel");

const app = express();
app.use(express.json());

// Setup a route to test the controller method directly or use the controller method in the test
// Since the controller is exported as an instance, we can call the method directly if we mock req and res, 
// OR we can mount it to an express app. Mounting is often easier for integration-style unit tests, 
// but unit testing the controller function directly with mocked req/res is more isolated.
// Given the BaseController methods take (req, res), let's call them directly with mocked objects.

describe("UserController - Update (put)", () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        req = {
            params: { id: "123" },
            body: { username: "updatedUser" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    it("should update a user successfully and return 201", async () => {
        const mockUpdatedUser = { _id: "123", username: "updatedUser", email: "test@test.com" };

        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

        await userController.put(req, res);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("123", req.body, { new: true, runValidators: true });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it("should return 404 if user not found", async () => {
        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

        await userController.put(req, res);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("123", req.body, { new: true, runValidators: true });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("The entity with the id 123 was not found");
    });

    it("should return 500 if an error occurs", async () => {
        const errorMessage = "Database error";
        (userModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error(errorMessage));

        await userController.put(req, res);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("123", req.body, { new: true, runValidators: true });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("An error occurred while updating data with the id: 123");
    });
});
