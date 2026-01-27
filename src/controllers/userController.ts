import userModel from "../models/userModel";
import User from "../types/user";
import BaseController from "./baseController";

class UserController extends BaseController<User> {
    constructor() {
        super(userModel);
    }
}

export default new UserController();
