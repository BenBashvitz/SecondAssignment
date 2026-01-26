import express from "express";
import postController from "../controllers/postController";

const router = express.Router();

router.post("/", postController.post.bind(postController));

router.get("/", postController.getAll.bind(postController));

router.get("/:id", postController.getById.bind(postController));

router.put("/:id", postController.put.bind(postController));

export default router;
