import mongoose from "mongoose";
import Post from "../types/post";

const postSchema = new mongoose.Schema<Post>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: false,
  },
});

export default mongoose.model("Post", postSchema);
