import { Types } from "mongoose";

export type PostInput = {
  title: string;
  description: string;
};

export type Post = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  sender: Types.ObjectId;
};
