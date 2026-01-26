import express from "express";
import commentController from "../controllers/commentsController";

const router = express.Router();

router.post("/", commentController.post.bind(commentController));

router.get("/", commentController.getAll.bind(commentController));

export default router;
