import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import mongoose from "mongoose";

export const getMessage = async (req, resp) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      resp.status(404).json({
        message: "Chat Not Found",
      });
    }
    const messages = await Message.find({ chatId: chat._id }).sort({
      createdAt: 1,
    });

    resp.status(200).json({
      message: "Your All Chats are",
      msg: messages,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};
