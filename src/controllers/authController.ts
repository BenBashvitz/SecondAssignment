import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import Tokens from "../types/tokens";

const generateTokens = (userId: string): Tokens => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpirationTimeSeconds =
    process.env.JWT_EXPIRATION_TIME_SECONDS ?? 3600;

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
    return res
      .status(400)
      .json({ message: "email, password, and username are required." });
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

    return res.status(201).json(tokens);
  } catch (error) {
    console.error("Register error: ", error);

    return res.status(500).json({ message: "Error creating user." });
  }
};

export default {
  register,
};
