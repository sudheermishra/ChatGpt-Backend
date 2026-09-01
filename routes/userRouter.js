import express from "express";
import {
  signUp,
  logIn,
  logOut,
  profile,
  deleteAccount,
} from "../controllers/userController.js";

import authUserMiddleware from "../middleware/authUserMiddleware.js";
import unauthenticatedUserRateLimiter from "../middleware/unAuthenticatedUserRateLimiter.js";
import authenticatedUserRateLimiter from "../middleware/authenticatedUserRateLimiter.js";
import loadUserMiddleware from "../middleware/loadUserMiddleware.js";
const userRouter = express.Router();

userRouter.post("/signup", unauthenticatedUserRateLimiter, signUp);

userRouter.post("/login", unauthenticatedUserRateLimiter, logIn);

userRouter.post(
  "/logout",
  authUserMiddleware,
  authenticatedUserRateLimiter,
  logOut,
);

userRouter.get(
  "/profile",
  authUserMiddleware,
  authenticatedUserRateLimiter,
  loadUserMiddleware,
  profile,
);

userRouter.delete(
  "/delete",
  authUserMiddleware,
  authenticatedUserRateLimiter,
  loadUserMiddleware,
  deleteAccount,
);

export default userRouter;
