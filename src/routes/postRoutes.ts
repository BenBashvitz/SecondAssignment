import express from "express";
import postController from "../controllers/postController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware, postController.post.bind(postController));

router.get("/", postController.getAll.bind(postController));

router.get("/:id", postController.getById.bind(postController));

router.put("/:id", authMiddleware, postController.put.bind(postController));

export default router;
