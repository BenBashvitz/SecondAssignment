import mongoose from "mongoose";
import Comment from "../types/comment";

const commentSchema = new mongoose.Schema<Comment>({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

export default mongoose.model("comment", commentSchema);
