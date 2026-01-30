import { Types } from "mongoose";

type PostInput = {
  title: string;
  description: string;
  sender: Types.ObjectId;
};

export type Post = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  sender: Types.ObjectId;
};

export default PostInput;
