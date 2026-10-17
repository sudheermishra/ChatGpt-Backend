# AI Chat Backend

A ChatGPT-style backend built with **Node.js, Express, MongoDB and Redis**. It handles user authentication, multi-model AI chat through the **OpenRouter API**, and keeps AI cost under control with Redis-based token quotas, rate limiting and automatic conversation summarization.

> **Status:** In progress. The backend is working end to end; a frontend and deployment are planned.

---

## Features

- **Authentication**: signup/login with bcrypt-hashed passwords and JWT stored in an `httpOnly` cookie. Request bodies are validated with Zod.
- **Secure logout**: on logout the JWT is added to a Redis blocklist with the same remaining lifetime as the token, so it can't be reused.
- **Multi-model AI chat**: every chat is tied to a model (any OpenRouter model id). Replies are generated through the OpenRouter SDK.
- **Token usage tracking**: prompt, completion and total tokens are recorded per chat and per user.
- **Token quota (Redis)**: each user gets a token budget per time window. Requests are rejected *before* any MongoDB or OpenRouter call once the budget is used up.
- **Rate limiting (Redis)**: per-user limits on authenticated routes and per-IP limits on signup/login. Both fail open, so a Redis outage doesn't take the API down.
- **Conversation summarization**: once 20 unsummarized messages pile up, they are summarized and stored on the chat. Later requests send the summary plus only the newer messages, which keeps prompts small and cheaper.
- **Chat sharing**: owners can generate a share link for a chat, see who has viewed it, and block specific viewers.
- **Lean auth layers**: token verification (`authUserMiddleware`) is separate from loading the user document (`loadUserMiddleware`), so routes that only need identity skip the extra database read.

---

## Tech Stack

| Area | Tools |
|---|---|
| Runtime / framework | Node.js (ES modules), Express |
| Database | MongoDB with Mongoose |
| Cache / limits | Redis (`redis` client) |
| AI | OpenRouter (`@openrouter/sdk`) |
| Auth | `jsonwebtoken`, `bcrypt`, `cookie-parser` |
| Validation | Zod |

---

## How a message request flows

`POST /msg` or `POST /msg/:chatId` passes through these steps in order:

1. `authUserMiddleware`: verifies the JWT from the cookie and checks it isn't on the Redis blocklist
2. `authenticatedUserRateLimiter`: per-user request limit (Redis)
3. `tokenUsageMiddleware`: rejects with `429` if the user's token quota is exhausted (Redis)
4. `loadUserMiddleware`: loads the user from MongoDB
5. `sendMessage` controller:
   - finds the chat (or creates one if no `chatId` is given)
   - builds the AI context: system prompt + chat summary + unsummarized messages + the new message
   - calls OpenRouter, saves the user and assistant messages
   - updates token usage on the chat, the user, and the Redis quota counter
   - triggers summarization when enough new messages have accumulated

---

## Project Structure

```
.
├── index.js                # App entry: middleware, routes, DB + Redis connect
├── config/
│   ├── database.js         # MongoDB connection
│   ├── redis.js            # Redis client
│   └── openRouter.js       # OpenRouter client
├── controllers/
│   ├── userController.js
│   ├── chatController.js   # chats + sharing + blocking
│   └── messageController.js
├── middleware/
│   ├── authUserMiddleware.js
│   ├── loadUserMiddleware.js
│   ├── tokenUsageMiddleware.js
│   ├── authenticatedUserRateLimiter.js
│   └── unauthenticatedUserRateLimiter.js
├── model/                  # Mongoose schemas: User, Chat, Message, Share
├── routes/                 # userRouter, chatRouter, messageRouter
├── services/
│   ├── openRouterService.js
│   └── summaryService.js
├── utils/
│   ├── chatContext.js      # Builds the message array sent to the AI
│   ├── chatTokenUsage.js
│   └── userUsage.js
└── validators/
    └── userValidator.js    # Zod schemas for signup/login
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running MongoDB instance (local or Atlas)
- A running Redis instance
- An [OpenRouter](https://openrouter.ai) API key

### Install

```bash
git clone https://github.com/sudheermishra/ChatGpt-Backend.git
cd ChatGpt-Backend
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-backend
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_long_random_secret
OPENROUTER_API_KEY=your_openrouter_key

# Token quota per user: TOKEN_LIMIT tokens per TOKEN_WINDOW_SECONDS
TOKEN_LIMIT=50000
TOKEN_WINDOW_SECONDS=18000

# Base URL used when building share links
DOMAIN_NAME=http://localhost:5000
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `MONGO_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | Secret used to sign JWTs |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `TOKEN_LIMIT` | Max tokens a user can consume per window |
| `TOKEN_WINDOW_SECONDS` | Length of the quota window in seconds (`18000` = 5 hours) |
| `DOMAIN_NAME` | Base URL used to build share links |

### Run

```bash
node index.js
```

The server prints `Server is listening on Port <PORT>` once MongoDB and Redis are connected.

---

## API Reference

All routes except `/`, `signup` and `login` require a valid auth cookie (set automatically on signup/login).

### Auth and user: `/user`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/signup` | Create an account |
| POST | `/user/login` | Log in and receive the auth cookie |
| POST | `/user/logout` | Log out and blocklist the current token |
| GET | `/user/profile` | Get the current user's profile and usage |
| DELETE | `/user/delete` | Delete the account along with all its chats and messages |

**Signup body**

```json
{
  "name": "Sudheer",
  "age": 24,
  "email": "you@example.com",
  "password": "Str0ng@Pass"
}
```

Password rules: 8 to 30 characters with at least one lowercase letter, one uppercase letter, one number and one special character.

### Chats: `/chat`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/createChat` | Create a chat. Body: `{ "model": "<openrouter-model-id>" }` |
| GET | `/chat/getRecentChat` | List the user's chats, most recently updated first |
| GET | `/chat/:chatId` | Get one chat's details and token usage |
| DELETE | `/chat/:chatId` | Delete a chat and its messages |

### Messages: `/msg`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/msg` | Send a message and start a new chat. Body: `{ "content": "...", "model": "..." }` |
| POST | `/msg/:chatId` | Send a message in an existing chat. Body: `{ "content": "..." }` |
| GET | `/msg/:chatId` | Get all messages of a chat |

**Example response (`POST /msg/:chatId`)**

```json
{
  "message": "Message sent successfully",
  "chatId": "...",
  "reply": "...",
  "usage": { "promptTokens": 120, "completionTokens": 80, "totalTokens": 200 },
  "tokenUsed": 200,
  "tokenLimit": 50000
}
```

### Sharing: `/chat/share`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/share` | Create a share link for a chat you own. Body: `{ "chatId": "..." }` |
| GET | `/chat/share/:shareId` | View a shared chat's messages (the viewer is logged in the share's access list) |
| GET | `/chat/share/:shareId/list` | Owner only: list the users who viewed the share |
| PATCH | `/chat/share/:shareId/block/:userId` | Owner only: block a viewer from the share |

---

## Limits and Quotas

| What | Limit | Scope |
|---|---|---|
| Authenticated requests | 20 per minute | per user |
| Signup / login requests | 10 per minute | per IP |
| AI tokens | `TOKEN_LIMIT` per `TOKEN_WINDOW_SECONDS` | per user |

Exceeding a limit returns `429 Too Many Requests` with the remaining wait time.

---

## Author

**Sudheer Mishra**: [GitHub](https://github.com/sudheermishra) · [LinkedIn](https://www.linkedin.com/in/sudheer-mishra-b7302a258/) · [X](https://x.com/Sudheer7ms)
