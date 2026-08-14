import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";

export const createChat = async (req, resp) => {
  try {
    const { model } = req.body;
    if (!model) {
      return resp.status(400).json({
        message: "Model Name Is Missing",
      });
    }

    const chats = await Chat.create({ userId: req.user._id, model: model });
    console.log("chats are :", chats);
    resp.status(201).json({
      message: "Chat Created Successfully",
      chatId: chats._id,
      userId: req.user._id,
      model: model,
      topic: chats.topic,
      createdAt: chats.createdAt,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getRecentChat = async (req, resp) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select("topic updatedAt model")
      .sort({ updatedAt: -1 });

    resp.status(200).json({
      message: " Your All Recents Chats",
      chats,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getSingleChat = async (req, resp) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return resp.status(403).json({
        message: "Data Not Found",
      });
    }

    resp.status(200).json({
      chatId: chat._id,
      userId: req.user._id,
      topic: chat.topic,
      usage: chat.usage,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteSingleChat = async (req, resp) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    console.log("chat are", chat);
    if (!chat) {
      resp.status(403).json({
        message: "You are not allowed to do this",
      });
    }

    await Message.deleteMany({ chatId: chat._id });
    await chat.deleteOne({ _id: chatId });

    resp.status(200).json({
      message: "Chat Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};
