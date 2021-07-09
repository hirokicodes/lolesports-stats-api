import redis from "redis";

export const redisClient =
  process.env.NODE_ENV === "production"
    ? redis.createClient({
        host: process.env.REDIS_URL!,
        port: parseInt(process.env.REDIS_PORT!),
        password: process.env.REDIS_PASSWORD!,
      })
    : redis.createClient();

redisClient.on("error", function (error) {
  console.error(error);
});

redisClient.set("key", "value", redis.print);
redisClient.get("key", redis.print);
