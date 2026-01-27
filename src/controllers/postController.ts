import postModel from "../models/postModel";
import Post from "../types/post";
import BaseController from "./baseController";

class PostController extends BaseController<Post> {
  constructor() {
    super(postModel);
  }
}

export default new PostController();
