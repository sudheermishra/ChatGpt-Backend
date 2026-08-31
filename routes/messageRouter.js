import express from "express";
import authUserMiddleware from "../middleware/authUserMiddleware.js";
import { getMessage, sendMessage } from "../controllers/messageController.js";
import authenticatedUserRateLimiter from "../middleware/authenticatedUserRateLimiter.js";
const messageRouter = express.Router();

messageRouter.use(authUserMiddleware);
messageRouter.use(authenticatedUserRateLimiter);

messageRouter.post("/", sendMessage);
messageRouter.post("/:chatId", sendMessage);
messageRouter.get("/:chatId", getMessage);

export default messageRouter;
