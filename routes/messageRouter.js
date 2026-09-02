import express from "express";
import authUserMiddleware from "../middleware/authUserMiddleware.js";
import { getMessage, sendMessage } from "../controllers/messageController.js";
import authenticatedUserRateLimiter from "../middleware/authenticatedUserRateLimiter.js";
import tokenUsageMiddleware from "../middleware/tokenUsageMiddleware.js";
import loadUserMiddleware from "../middleware/loadUserMiddleware.js";
const messageRouter = express.Router();

messageRouter.use(authUserMiddleware);
messageRouter.use(authenticatedUserRateLimiter);

messageRouter.post("/", tokenUsageMiddleware, loadUserMiddleware, sendMessage);
messageRouter.post(
  "/:chatId",
  tokenUsageMiddleware,
  loadUserMiddleware,
  sendMessage,
);
messageRouter.get("/:chatId", loadUserMiddleware, getMessage);

export default messageRouter;
