import { Types } from "mongoose";

type Post = {
  title: string;
  description: string;
  sender: Types.ObjectId;
};

export default Post;
