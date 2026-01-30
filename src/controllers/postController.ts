import postModel from "../models/postModel";
import PostInput from "../types/post";
import BaseController from "./baseController";

class PostController extends BaseController<PostInput> {
  constructor() {
    super(postModel);
  }
}

export default new PostController();
