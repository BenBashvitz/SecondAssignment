type User = {
  email: string;
  username: string;
  password: string;
  _id: string;
};

export type UserInput = Omit<User, "_id">;

export default User;
