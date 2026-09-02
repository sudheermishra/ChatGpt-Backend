import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import mongoose from "mongoose";
import { addUserTokenUsage } from "../utils/userUsage.js";
import { buildMessageForAi } from "../utils/chatContext.js";
import { generateAiResponse } from "../services/openRouterService.js";
import { addChatTokenUsage } from "../utils/chatTokenUsage.js";
import { updateSummaryIfNeeded } from "../services/summaryService.js";
import { redisClient } from "../config/redis.js";
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

export const sendMessage = async (req, resp) => {
  try {
    const { chatId } = req.params;
    const { content, model } = req.body;

    if (!content || content.trim() === "") {
      return resp.status(400).json({
        message: "Content is Missing",
      });
    }

    let chat;
    // chatId h means user have already chats then first find all chats
    if (chatId) {
      // chat Id h toh validate kro user ki match kr rahi h h ki nhi
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return resp.status(400).json({
          message: "Invalid chat id",
        });
      }
      // find chat
      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });

      if (!chat) {
        return resp.status(404).json({
          message: "Chat Not Found",
        });
      }
    } else {
      // chatId is not  available then we have to create a chatId
      // user ki chat Id nhi h toh nayi create kro model ke basis prr
      if (!model) {
        return resp.status(400).json({
          message: "Model Is Required For New Chat",
        });
      }
      chat = await Chat.create({
        userId: req.user._id,
        model: model,
        topic: content.trim().slice(0, 40),
      });
    }

    const oldMessages = await Message.find({ chatId: chat._id })
      .sort({ createdAt: 1 })
      .skip(chat.summarizedTillMessageNumber);

    const messagesForAI = buildMessageForAi({
      chat,
      oldMessages,
      currentMessage: content.trim(),
    });

    const { aiReply, usage } = await generateAiResponse({
      model: chat.model,
      messages: messagesForAI,
    });

    const userMessage = await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: "user",
      content: content.trim(),
    });

    const assistantMessage = await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: "assistant",
      content: aiReply,
    });

    chat.messageCount += 2;

    if (chat.topic === "New Chat") {
      chat.topic = content.trim().slice(0, 40);
    }

    await addChatTokenUsage(chat, usage);
    await addUserTokenUsage(req.user, usage.totalTokens);

    await chat.save();

    const tokenUsed = await redisClient.incrBy(
      req.tokenUsageKey,
      usage.totalTokens,
    );

    if (tokenUsed === usage.totalTokens) {
      await redisClient.expire(
        req.tokenUsageKey,
        Number(process.env.TOKEN_WINDOW_SECONDS),
      );
    }
    resp.status(201).json({
      message: "Message sent successfully",
      chatId: chat._id,
      reply: aiReply,
      usage,
      tokenUsed,
      tokenLimit: Number(process.env.TOKEN_LIMIT),
      userMessage,
      assistantMessage,
    });

    await updateSummaryIfNeeded(chat._id);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};
