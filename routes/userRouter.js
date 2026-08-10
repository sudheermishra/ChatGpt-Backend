import express from "express";
import { signUp } from "../controllers/userController.js";
const userRouter = express.Router();

userRouter.post("/signup", signUp);
// userRouter.post("/login", logIn);
// userRouter.post("/logout", logOut);
// userRouter.delete("/delete", deleteAccount);
// userRouter.get("/profile", profile);

export default userRouter;
