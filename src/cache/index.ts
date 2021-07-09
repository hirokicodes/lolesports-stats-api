import { Response, Request, NextFunction } from "express";

import { redisClient } from "./redisClient";

export const isCached = (req: Request, res: Response, next: NextFunction) => {
  console.log("isCached? URL: ", req.path);

  console.log(req.originalUrl);
  const path = req.originalUrl;
  const q = JSON.stringify(req.query);
  console.log("STRINGIFIED q:", q);

  // If unique combination of path and query as redis key
  const redisKey = path + q;
  console.log("REDISKEY: ", redisKey);

  // getting our data by key
  redisClient.get(redisKey, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (data != null) {
      console.log("KEY FOUND IN REDIS 🟢");
      return res.send(JSON.parse(data));
    } else {
      console.log("DOES NOT EXIST IN REDIS 🔴 ");
      // go To ⏭️ function or middleware
      next();
    }
  });
};
