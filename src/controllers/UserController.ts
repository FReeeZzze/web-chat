import express from "express";
import { UserModel, DialogModel } from "../models";
import { IUser } from "../models/User";
import { Types } from 'mongoose';
import socket from "socket.io";

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

  addContact = (req: express.Request, res: express.Response) => {
    try {
      const myId: string = req.user.userId;
      const id: Types.ObjectId = req.body.id;
      UserModel.findById(myId, (err: any, user: IUser) => {
        if (err || !user) {
          return res.status(500).json({
            message: "User not found",
            status: 'error'
          });
        }

        user.contacts = [... user.contacts, id ];

        user.save(function (err) {
          if(err) {
            return res.status(500).json({
              message: err.message,
              status: 'error'
            });
          }
        });

        return res.status(200).json({
          status: 'success'
        })
      });

    } catch (e) {
      res.status(500).json({
        error: e.message,
        status: 'error'
      })
    }
  };

  getContacts = (req: express.Request, res: express.Response) => {
    try {
      const me = req.user;

      UserModel
        .findOne({
          _id: me.userId
        }, async (err, user: IUser) => {
          if (err || !user) {
            return res.status(404).json({
              message: "User not found",
            });
          }
          const contacts = user.contacts;
          const myContacts = await UserModel.find({_id: {$in: contacts}}, 'name username avatar email last_seen dialogs').exec();
          if (!myContacts) {
            return res.status(404).json({
              message: "Not found",
              status: 'bad'
            });
          }
          return res.status(200).json({
            result: myContacts,
            status: 'success'
          })
        })
    } catch(e) {
      res.status(500).json({
        error: e.message,
        status: 'error'
      })
    }
  };

  getMe = async (req: express.Request, res: express.Response) => {
    try {
      const myId: string = req.user.userId;
      const user = await UserModel.findById(myId,  'contacts dialogs email _id name last_seen username').exec();
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      return res.status(200).json({
        result: user,
        status: 'success'
      })

    } catch (e) {
      res.status(500).json({
        error: e.message,
        status: 'error'
      })
    }
  };

  findUsers = (req: express.Request, res: express.Response): void => {
    try {
      const search: any = req.query.search;
      UserModel.find({ _id: { $ne: req.user.userId } })
        .or([
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i")},
        ])
        .then((users: IUser[]) => {
          return res.status(200).json({
            result: users,
            status: 'success'
          })
        })
        .catch((err: any) => {
          return res.status(404).json({
            status: "error",
            message: err,
          });
        });
    } catch (e) {
      res.status(500).json({
        error: e.message,
        status: 'error'
      })
    }
  };

  async getUsers(req: express.Request, res: express.Response) {
    try {
      const myId: string = req.user.userId;
      UserModel.find({
        _id : { $ne : myId }
      }).populate('Dialogs').exec(async (err, users) => {
        for ( let key of users ) {
          key.dialogs = await DialogModel.find({ users: key._id });
        }
        return res.status(200).json({
          result: users,
          status: 'success'
        })
      });

    } catch (e) {
      res.status(500).json({
        error: e.message,
        status: 'error'
      })
    }
  }
}

export default UserController;
