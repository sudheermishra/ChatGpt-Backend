const SYSTEM_PROMPT = ` 
You are a helpful AI assistant. 
Answer the user's question clearly and accurately. 
If the user asks for code, provide clean and practical code. 
If the user asks for explanation, explain in a simple and structured way. 
If you are unsure, say that you are unsure instead of guessing. 
`;

export const buildMessageForAi = ({ chat, oldMessages, currentMessage }) => {
  // Create the message array that will be sent to the AI
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];

  // Add the conversation summary if it exists and is not empty after trimming
  // Example: Summary contains messages 1-40
  if (chat.summary && chat.summary.trim() !== "") {
    messages.push({
      role: "system",
      content: `Previous conversation summary:\n${chat.summary}`,
    });
  }

  // Add the older messages that have not been included in the summary
  // Example: Old messages contain messages 41-48
  for (const msg of oldMessages) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Add the user's current message
  // Example: Current message is message 49
  messages.push({
    role: "user",
    content: currentMessage,
  });

  return messages;
};
