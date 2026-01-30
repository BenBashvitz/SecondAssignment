import mongoose from "mongoose";
import PostInput from "../types/post";

const postSchema = new mongoose.Schema<PostInput>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export default mongoose.model("Post", postSchema);
