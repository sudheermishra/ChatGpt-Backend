import express from "express";
import authUserMiddleware from "../middleware/authUserMiddleware.js";
import {
  createChat,
  getRecentChat,
  getSingleChat,
  deleteSingleChat,
} from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.use(authUserMiddleware);

chatRouter.post("/createChat", createChat);

chatRouter.get("/getRecentChat", getRecentChat);

chatRouter.get("/:chatId", getSingleChat);

chatRouter.delete("/:chatId", deleteSingleChat);

export default chatRouter;
