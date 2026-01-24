import movieModel from "../models/postModel";
import Post from "../types/post";
import BaseController from "./baseController";

class PostController extends BaseController<Post> {
  constructor() {
    super(movieModel);
  }
}

export default new PostController();
