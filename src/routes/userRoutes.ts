import express from "express";
import userController from "../controllers/userController";

const router = express.Router();

router.post("/", userController.post.bind(userController));

export default router;
