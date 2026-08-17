import { OpenRouter } from "@openrouter/sdk";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing");
}

const openRouter = new OpenRouter({
  apikey: process.env.OPENROUTER_API_KEY,
});

export default openRouter;
