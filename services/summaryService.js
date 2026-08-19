import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import { generateAiResponse } from "./openRouterService.js";

// har summary krne ki limit set kr di 20 chat p hi summary krenge
const SUMMARY_CHUNK_SIZE = 20;

export const updateSummaryIfNeeded = async (chatId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) return;

  // totlaMessagecount hue abhi tak chat me usme se Summarizedtiil mesaagenumber ko subtract kr dunga
  // chatmodel me already db me pade h yeh
  const unSummarizedCount =
    chat.messageCount - chat.summarizedTillMessageNumber;

  // agar subtract krne ke baad value 20 se kam aayi toh summary krna hi nhi h yhi se return kra denge
  if (unSummarizedCount < SUMMARY_CHUNK_SIZE) return;

  // agar value badi nikali toh toh message wale model me jayange db me or wha se isi chatid ke reagerdingg message nkalnege saare
  // but konse message nikalne h jo purane wale h assecinding order wale
  // skip kr dena jinki already summary nikali hui h chat model me se nikal ke number
  // limit laga di sirf 20 hi nikal
  const messagesToSummarize = await Message.find({ chatId: chat._id })
    .sort({ createdAt: 1 })
    .skip(chat.summarizedTillMessageNumber)
    .limit(SUMMARY_CHUNK_SIZE);

  // jo bhi messageToSummarize aayega woh array me ayega q ki 1 nhi aayenge msg toh hum chehck kre enge ki uski length 0 toh nhi h

  if (messagesToSummarize.length === 0) return;

  const summaryMessages = [
    {
      role: "system",
      content:
        "Summarize the conversation. Keep important context, user goals, decisions, and unresolved doubts. Do not add extra information.",
    },

    {
      role: "user",
      content: `Previous summary: ${chat.summary || "No previous summary yet."}`,
    },

    ...messagesToSummarize.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),

    {
      role: "user",
      content: "Summarize the above conversation.",
    },
  ];

  const { aiReply, usage } = await generateAiResponse({
    model: chat.model,
    messages: summaryMessages,
  });

  chat.summary = aiReply;
  chat.summaryUpdateAt = new Date();
  chat.summarizedTillMessageNumber += messagesToSummarize.length;

  chat.usage.promptTokens += usage.promptTokens;
  chat.usage.completionTokens += usage.completionTokens;
  chat.usage.totalTokens += usage.totalTokens;

  await chat.save();

  const user = await User.findById(chat.userId);

  if (user) {
    user.usage.tokenUsed += usage.totalTokens;
    user.usage.totalTokenUsed += usage.totalTokens;
    await user.save();
  }
};
