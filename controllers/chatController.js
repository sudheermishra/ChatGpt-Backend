import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import Share from "../model/shareSchema.js";

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

export const shareChat = async (req, resp) => {
  try {
    const { chatId } = req.body;
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return resp.status(404).json({
        message: "chat not found",
      });
    }

    const share = await Share.create({
      chatId: chatId,
      userId: req.user._id,
    });
    resp.status(201).json({
      message: "ShareId created successfully",
      shareId: `${process.env.DOMAIN_NAME}/chat/share/${share._id}`,
      share,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getShareChat = async (req, resp) => {
  try {
    const { shareId } = req.params;
    const share = await Share.findByIdAndUpdate(
      shareId,
      {
        $push: { accessedBy: [{ userId: req.user._id }] },
      },
      { new: true },
    );

    if (!share) {
      return resp.status(403).json({
        message: "Shared chat not found",
      });
    }

    const accessedUser = await share.accessedBy.find((user) =>
      user.userId.equals(req.user._id),
    );

    if (accessedUser?.blockFlag == true) {
      return resp.status(403).json({
        message: "You are blocked from this share chat",
      });
    }
    const messages = await Message.find({ chatId: share.chatId });

    resp.status(200).json({
      messages,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const shareList = async (req, resp) => {
  try {
    const { shareId } = req.params;
    const share = await Share.findOne({
      _id: shareId,
      userId: req.user._id,
    }).populate("accessedBy.userId", "name email");

    if (!share) {
      return resp.status(403).json({
        message: "Not Allowed",
      });
    }
    resp.status(200).json({
      message: "Viewers list",
      viewers: share.accessedBy,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const blockUser = async (req, resp) => {
  try {
    const { shareId, userId } = req.params;
    const share = await Share.findById({ _id: shareId });
    if (!share) {
      return resp.status(404).json({
        message: "Share Chat Found",
      });
    }

    // owner khud ko block naa kr ske
    if (share.userId.equals(userId)) {
      return resp.status(400).json({
        message: "Owner cannot block himself",
      });
    }

    // agar owner ki id equal nhi h schema toh yehi se return sirf owner hi block kr skta h
    if (!share.userId.equals(req.user._id)) {
      return resp.status(403).json({
        message: "You are not the owner of this share chat",
      });
    }

    await Share.updateOne(
      {
        _id: shareId,
        "accessedBy.userId": userId,
      },
      {
        $set: {
          "accessedBy.$.blockFlag": true,
        },
      },
    );

    return resp.status(200).json({
      message: "User blocked successfully",
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};
