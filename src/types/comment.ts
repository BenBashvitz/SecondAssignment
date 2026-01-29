import { Types } from "mongoose";

type Comment = {
  message: string;
  postId: Types.ObjectId;
  sender: Types.ObjectId;
};

export default Comment;
