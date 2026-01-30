import { Model } from "mongoose";
import Comment from "../types/comment";

export async function cleanupBeforeCommentTests(model: Model<Comment>, data: Array<Comment>, userIds: string[], postIds: string[]) {
    await model.deleteMany();
    const commentsWithUserAndPost = data.map((comment, index) => ({
        ...comment,
        sender: userIds[index],
        postId: postIds[index],
    }));
    return model.create(commentsWithUserAndPost);
}