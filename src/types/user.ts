export type User = {
  email: string;
  password: string;
  username: string;
  _id: string;
  refreshTokens: string[];
};

export type UserInput = Omit<User, "_id">;
