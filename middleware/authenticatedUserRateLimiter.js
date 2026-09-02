import { redisClient } from "../config/redis.js";

const authenticatedUserRateLimiter = async (req, resp, next) => {
  try {
    const userId = req.userId;

    const key = `rate-limit:user:${userId}`;

    const requestCount = await redisClient.incr(key);

    if (requestCount === 1) {
      await redisClient.expire(key, 60);
    }

    if (requestCount > 20) {
      const remainingTime = await redisClient.ttl(key);
      return resp.status(429).json({
        message: `Too many requests. Try again after ${remainingTime} seconds.`,
      });
    }
    next();
  } catch (error) {
    console.log("Authenticated rate limiter error:", error);
    next();
  }
};

export default authenticatedUserRateLimiter;
