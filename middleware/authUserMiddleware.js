import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";

const authUserMiddleware = async (req, resp, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return resp.status(401).json({ message: "Please Login First" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const blockedToken = await redisClient.get(`blocklist:${token}`);
    if (blockedToken) {
      return resp.status(401).json({
        message: "Please login again",
      });
    }

    req.userId = payload.id;
    req.token = token;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
};

export default authUserMiddleware;
