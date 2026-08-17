import express from "express";
import {
  signUp,
  logIn,
  logOut,
  profile,
  deleteAccount,
} from "../controllers/userController.js";

import authUserMiddleware from "../middleware/authUserMiddleware.js";

const userRouter = express.Router();

userRouter.post("/signup", signUp);

userRouter.post("/login", logIn);

userRouter.post("/logout", logOut);

userRouter.get("/profile", authUserMiddleware, profile);

userRouter.delete("/delete", deleteAccount);

export default userRouter;
