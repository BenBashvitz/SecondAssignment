import { Types } from "mongoose";

export type User = {
  email: string;
  username: string;
  password: string;
  _id: Types.ObjectId;
};

export type UserInput = Omit<User, "_id">;
