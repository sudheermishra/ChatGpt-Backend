import { signupSchema, loginSchema } from "../validators/userValidator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

function createToken(userId, email) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }
  return jwt.sign({ id: userId, email: email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

const cookieOptions = {
  httpOnly: true,
  secure: false,
  maxAge: 60 * 60 * 1000,
};

export const signUp = async (req, resp) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return resp.status(400).json({
        message: result.error.issues[0].message,
      });
    }
    console.log("result data are ", result);
    const { name, age, email, password } = result.data;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return resp.status(409).json({
        message: "User already exists",
      });
    }
    const saltRound = 12;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    const user = await User.create({
      name: name,
      age: age,
      email: email,
      password: hashedPassword,
    });

    const token = createToken(user._id, user.email);
    resp.cookie("token", token, cookieOptions);

    resp.status(201).json({
      message: "User Created Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
      },
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const logIn = async (req, resp) => {
  try {
  } catch (error) {}
};

// export const logOut = async (req, resp) => {};

// export const deleteAccount = async (req, resp) => {};

// export const profile = async (req, resp) => {};
