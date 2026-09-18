import mongoose from "mongoose";

const shareSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  { timeStamps: true },
);

const Share = mongoose.model("Share", shareSchema);
export default Share;
