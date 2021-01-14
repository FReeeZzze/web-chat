import express from 'express';
import { UserModel, DialogModel } from "../models";
import { Server } from "socket.io";
import { IDialog }  from "../models/Dialog";
import handleError from "../utils/handle.error";

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      userId: string;
    },
  }
}

class DialogController {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  getDialogs = (req:express.Request, res:express.Response) => {
    try {
      // при авторизации мы можем обращаться к своему обьекту
      const me = req.user;

      DialogModel
        .find({
          users: me.userId
        })
        .populate('User')
        .exec(async function (err, dialogs: IDialog[]) {
          if (err) return handleError(500, err.message, res);
          const dialogsResult: IDialog[] = [];
          for ( let key of dialogs ) {
            await UserModel.find({ _id: key.users }).then(function(users) {
              key.users = users;
              dialogsResult.push(key);
            })
          }
          res.status(200).json({
            result: dialogsResult,
            status: 'success',
          })
        });


    } catch (e) {
      return handleError(500, e.message, res);
    }
  };

 createDialog = async (req: express.Request, res: express.Response) => {
    try {
      // при авторизации мы можем обращаться к своему обьекту
      const me = req.user;
      // получаем пользователя с кем мы хотим создать диалог
      const { id_user } = req.body;
      const postData = {
        users: [me.userId, id_user],
        messages: [],
      };

      const isDialog: IDialog | null = await DialogModel.findOne({ users: {$all: [id_user, me.userId] }});

      if (isDialog) {
        this.io.emit("SERVER:CURRENT_DIALOG", isDialog);
        return res.status(200).json({
          result: isDialog,
          status: 'found'
        });
      }

      const dialog = new DialogModel(postData);

      dialog.save((err, dialog: IDialog) => {
        if (err)
          return handleError(500, err.message, res);
        res.status(200).json({
          result: dialog,
          status: "success"
        });

        this.io.emit("SERVER:DIALOG_CREATED", dialog);
      });

    } catch (e) {
      return handleError(500, e.message, res);
    }
  }
}

export default DialogController;

