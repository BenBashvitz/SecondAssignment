import mongoose from "mongoose";
import Comment from "../types/comment";

const commentSchema = new mongoose.Schema<Comment>({
  postId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

export default mongoose.model("comment", commentSchema);
