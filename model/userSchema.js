import mongoose from "mongoose";
import { type } from "node:os";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    usage: {
      totalTokenUsed: {
        type: Number,
        default: 0,
      },
    },
  },
  { timeStamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
