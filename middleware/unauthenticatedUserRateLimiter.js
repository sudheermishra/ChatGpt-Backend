import { redisClient } from "../config/redis.js";

export const unauthenticatedUserRateLimiter = async (req, resp, next) => {
  try {
    const key = `rate-limit:ip:${req.ip}`;

    // First, check whether the key is already present in Redis.

    // const limit = await redisClient.get(key);

    // If the key exists, Redis returns its value.
    // If the key does not exist, Redis returns null.

    // If the key does not exist, initialize its value to 0
    // and set a TTL (Time To Live) of 60 seconds.

    // if (limit == null) {
    //   await redisClient.set(key, 0, {
    //     EX: 60,
    //   });
    // } else {

    //   // If the request count reaches the limit (10),
    //   // reject the request with HTTP 429 (Too Many Requests).

    //   if (limit == 10) {
    //     return resp.status(429).json({
    //       message: `Too many requests. Try again after ${remainingTime} seconds.`,
    //     });
    //   }
    // }

    const requestCount = await redisClient.incr(key);
    if (requestCount === 1) {
      await redisClient.expire(key, 60);
    }

    if (requestCount > 10) {
      const remainingTime = await redisClient.ttl(key);
      return resp.status(429).json({
        message: `Too many requests. Try again after ${remainingTime} seconds.`,
      });
    }

    next();
  } catch (error) {
    console.log("Unauthenticated rate limiter error:", error);

    // If Redis fails, don't stop the entire application.
    next();
  }
};

export default unauthenticatedUserRateLimiter;
