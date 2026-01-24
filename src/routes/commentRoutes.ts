import express from "express";
import commentController from "../controllers/commentsController";

const router = express.Router();

router.post("/", commentController.post.bind(commentController));

export default router;
