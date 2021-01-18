import express from 'express';
import { UserModel } from '../models';

export default (req: express.Request, _: express.Response, next: express.NextFunction) => {
  if (req.user) {
    UserModel.findOneAndUpdate(
      { _id: req.user.userId },
      {
        last_seen: new Date(),
      },
      { new: true },
    ).exec();
  }
  next();
};
