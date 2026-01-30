import postModel from "../models/postModel";
import PostInput from "../types/post";
import { AuthRequest } from "../types/request";
import BaseController from "./baseController";
import { Response } from "express";

class PostController extends BaseController<PostInput> {
  constructor() {
    super(postModel);
  }

  async post(req: AuthRequest, res: Response) {
    const userId = req.user?._id;

    req.body.sender = userId;

    return super.post(req, res);
  }

  async put(req: AuthRequest, res: Response) {
    const userId = req.user?._id;

    const post = await postModel.findById(req.params.id);

    if (post?.sender.toString() !== userId) {
      return res.status(403).send("You are not authorized to update this post");
    }

    return super.put(req, res);
  }
}

export default new PostController();
