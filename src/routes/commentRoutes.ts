import express from "express";
import commentController from "../controllers/commentsController";

const router = express.Router();

router.post("/", commentController.post.bind(commentController));

router.get("/", commentController.getAll.bind(commentController));

router.put("/:id", commentController.put.bind(commentController));

router.delete("/:id", commentController.delete.bind(commentController));

export default router;
