import express from 'express';
import { MessageModel, UserModel } from "../models";
import socket from "socket.io";
// import { IDialog }  from "../models/Dialog";
import { IUser } from "../models/User";
import { IMessage } from "../models/Message";
import handleError from "../utils/handle.error";

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      userId: string;
    },
  }
}

class MessageController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  async getMessages(req:express.Request, res:express.Response) {
    try {
      // при авторизации мы можем обращаться к своему обьекту
      const me = req.user;

    } catch (e) {
      return handleError(500, e.message, res);
    }
  }

  async createMessage(req: express.Request, res: express.Response) {
    try {
      const myId: string = req.user.userId;
      const me: IUser | null = await UserModel.findById(myId);

      if(me) {
        const postData = {
          from: me,
          message: req.body.message
        };

        const newMessage = new MessageModel(postData);

        await newMessage.save((err, message: IMessage) => {
          if (err) return handleError(500, err.message, res);
          return res.status(200).json({
            result: message,
            status: 'success',
          });

          // this.io.emit('SERVER:MESSAGE_CREATED', message);
        });
      }
      else return handleError(500, 'Непредвиденная ошибка', res)

    } catch (e) {
      return handleError(500, e.message, res);
    }
  }
}

export default MessageController;

