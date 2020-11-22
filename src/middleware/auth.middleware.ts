import express from "express";
import jwt from "jsonwebtoken";
import config from "config";

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      userId: string;
    },
  }
}

export default (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.method === "OPTIONS") return next();
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Нет авторизации" });
    }
    req.user = jwt.verify(token, config.get("jwtSecret"));
    next();
  } catch (e) {
    res.status(401).json({ message: "Нет авторизации" });
  }
};
