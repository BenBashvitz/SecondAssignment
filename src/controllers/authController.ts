import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import Tokens from "../types/tokens";
import DEFAULT_JWT_EXPIRATION_TIME_SECONDS from "../consts";

const generateTokens = (userId: string): Tokens => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpirationTimeSeconds =
    process.env.JWT_EXPIRATION_TIME_SECONDS ??
    DEFAULT_JWT_EXPIRATION_TIME_SECONDS;

  if (!jwtSecret) {
    throw new Error("JWT configuration error.");
  }

  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: +jwtExpirationTimeSeconds,
  });

  return { token };
};

const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).send("email, password, and username are required.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await userModel.create({
      email,
      password: hashedPassword,
      username,
    });

    const tokens = generateTokens(user._id.toString());

    await user.save();

    return res.status(201).json({ tokens, userId: user._id });
  } catch (error) {
    console.error("Register error: ", error);

    return res.status(500).send("Error creating user.");
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ message: "email, password, and username are required." });
  }

  try {
    const user = await userModel.findOne({ email, username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email, username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email, username or password." });
    }

    const tokens = generateTokens(user._id.toString());

    await user.save();

    return res.status(200).json(tokens);
  } catch (error) {
    console.error("Login error: ", error);

    return res.status(500).json({ message: "Error logging in." });
  }
};

export default {
  register,
  login,
};
