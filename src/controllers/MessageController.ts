import express from 'express';
import { MessageModel, DialogModel } from "../models";
import socket from "socket.io";
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

  getMessages = (req:express.Request, res:express.Response) => {
    try {
      const id = req.body.dialog;

      MessageModel.find({ dialog: id }, (err, messages) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: err,
          });
        }

        res.status(200).json({
          result: messages,
          status: 'success',
        })
      });

    } catch (e) {
      return handleError(500, e.message, res);
    }
  };

  createMessage = async (req: express.Request, res: express.Response) => {
    try {
      const myId: string = req.user.userId;

      const postData = {
        dialog: req.body.dialogId,
        message: req.body.message,
        attachments: req.body.attachments,
        from: myId,
        to: req.body.partner,
      };

      const message = new MessageModel(postData);

      message
        .save()
        .then((obj: IMessage) => {
          obj.populate(
            "dialog user attachments",
            (err: any, message: IMessage) => {
              if (err) {
                return res.status(500).json({
                  status: "error",
                  message: err,
                });
              }

              DialogModel.findOneAndUpdate(
                { _id: req.body.dialogId },
                { lastMessage: message._id },
                { upsert: true },
                function (err) {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: err,
                    });
                  }
                }
              );

              res.status(200).json({
                result: message,
                status: 'success',
              });

              this.io.emit("SERVER:NEW_MESSAGE", message);
            }
          );
        });

    } catch (e) {
      return handleError(500, e.message, res);
    }
  }
}

export default MessageController;

