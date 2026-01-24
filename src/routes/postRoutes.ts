import express from "express";
import postController from "../controllers/postController";

const router = express.Router();

router.post("/", postController.post.bind(postController));

router.get("/", postController.getAll.bind(postController));

export default router;
