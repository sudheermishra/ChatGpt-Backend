import express from "express";
import authUserMiddleware from "../middleware/authUserMiddleware.js";
import {
  createChat,
  getRecentChat,
  getSingleChat,
  deleteSingleChat,
  getShareChat,
  shareChat,
  shareList,
} from "../controllers/chatController.js";
import authenticatedUserRateLimiter from "../middleware/authenticatedUserRateLimiter.js";
import loadUserMiddleware from "../middleware/loadUserMiddleware.js";
const chatRouter = express.Router();

chatRouter.use(authUserMiddleware);
chatRouter.use(authenticatedUserRateLimiter);
chatRouter.use(loadUserMiddleware);

chatRouter.post("/createChat", createChat);
chatRouter.post("/share", shareChat);
chatRouter.get("/share/:shareId", getShareChat);
chatRouter.get("/share/:shareId/list", shareList);
chatRouter.get("/getRecentChat", getRecentChat);

chatRouter.get("/:chatId", getSingleChat);

chatRouter.delete("/:chatId", deleteSingleChat);

export default chatRouter;
