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
    const result = loginSchema.safeParse(req.body);
    console.log("Result are", result);
    if (!result.success) {
      return resp.status(400).json({
        message: result.error.issues[0].message,
      });
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email: email });
    if (!user) {
      return resp.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return resp.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const token = createToken(user._id, user.email);
    resp.cookie("token", token, cookieOptions);

    resp.status(200).json({
      message: "User logged in successfully",
      name: user.name,
      age: user.age,
      email: user.email,
      usage: user.usage,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const logOut = async (req, resp) => {
  try {
    resp.clearCookie("token", {
      httpOnly: true,
      secure: false,
    });

    resp.status(200).json({
      message: "User Logged Out Successfully",
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const profile = async (req, resp) => {
  try {
    const { name, age, email, usage } = req.user;
    resp.status(200).json({
      name: name,
      age: age,
      email: email,
      usage: usage,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// export const deleteAccount = async (req, resp) => {};
