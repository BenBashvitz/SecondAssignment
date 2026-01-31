import { Response } from "express";
import commentModel from "../models/commentModel";
import Comment from "../types/comment";
import { AuthRequest } from "../types/request";
import BaseController from "./baseController";

class CommentsController extends BaseController<Comment> {
    constructor() {
        super(commentModel);
    }

    override async post(req: AuthRequest, res: Response) {
        const userId = req.user?._id;

        req.body.sender = userId;

        await super.post(req, res);
    }

    override async put(req: AuthRequest, res: Response) {
        const userId = req.user?._id;

        const comment = await commentModel.findById(req.params.id);

        if (comment && comment.sender.toString() !== userId) {
            return res.status(403).send("You are not authorized to update this comment");
        }

        return super.put(req, res);
    }

    override async delete(req: AuthRequest, res: Response) {
        const userId = req.user?._id;

        const comment = await commentModel.findById(req.params.id);

        if (comment && comment.sender.toString() !== userId) {
            res.status(403).send("You are not authorized to delete this comment");
            return;
        }

        await super.delete(req, res);
    }
}

export default new CommentsController();
