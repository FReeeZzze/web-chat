import express from "express";
// import config from 'config';
import { UserModel } from "../models";
import { IUser } from "../models/User";
import socket from "socket.io";
// import { validationResult } from 'express-validator';

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      userId: string;
    },
  }
}

class UserController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  async getMe(req: express.Request, res: express.Response) {
    try {
      const myId: string = req.user.userId;
      const me: IUser | null = await UserModel.findById(myId);

      if(me) {
          return res.status(200).json({
            result: me,
          })
      }

    } catch (e) {
      res.status(500).json({
        error: e.message,
        status: 'error'
      })
    }
  }

  async getUsers(req: express.Request, res: express.Response) {
    try {
      const myId: string = req.user.userId;
      const users: IUser[] = await UserModel.find({
        _id : { $ne : myId }
      }); // найти всех пользователей кроме вас

      if(users) {
        return res.status(200).json({
          result: users,
          status: 'success'
        })
      }

    } catch (e) {
      res.status(500).json({
        error: e.message,
        status: 'error'
      })
    }
  }
}

export default UserController;
