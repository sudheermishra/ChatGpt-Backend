import Chat from "../model/chatSchema.js";

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
