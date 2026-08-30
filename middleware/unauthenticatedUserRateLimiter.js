import { redisClient } from "../config/redis.js";

export const unauthenticatedUserRateLimiter = async (req, resp, next) => {
  try {
    const key = `rate-limit:ip:${req.ip}`;

    const requestCount = await redisClient.incr(key);
    if (requestCount === 1) {
      await redisClient.expire(key, 60);
    }

    if (requestCount > 10) {
      const remainingTime = await redisClient.ttl(key);
    }

    return resp.status(429).json({
      message: `Too many requests. Try again after ${remainingTime} seconds.`,
    });
    next();
  } catch (error) {
    console.log("Unauthenticated rate limiter error:", error);

    // If Redis fails, don't stop the entire application.
    next();
  }
};

export default unauthenticatedUserRateLimiter;
