import openRouter from "../config/openRouter.js";

export const generateAiResponse = async ({ model, messages }) => {
  const completion = await openRouter.chat.send({
    chatRequest: {
      model: model,
      messages,
    },
  });

  console.log(completion.choices[0]);
  const aiReply = completion.choices[0]?.message?.content;

  if (!aiReply) {
    throw new Error("Ai Response Is Empty");
  }

  const promptTokens = completion.usage?.promptTokens || 0;
  const completionTokens = completion.usage?.completionTokens || 0;

  return {
    aiReply,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
  };
};
