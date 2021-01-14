import express from "express";
import { UploadModel } from "../models";
import { IUploadFile, IUploadFileDocument } from "../models/UploadFile";

declare module 'express-serve-static-core' {
  interface Request {
    file,
    files,
    user: {
      userId: string;
    },
  }
}

class UploadController {
  create = (req: express.Request, res: express.Response): void => {
    const userId: string = req.user.userId;
    const file: any = req.files;

    console.log(req.file, req.files);

    console.log(file);

    const fileData = {
      filename: file.originalname,
      size: file.size,
      ext: file.mimetype,
      url: file.path,
      message: req.body.message,
      user: userId,
    };

    const uploadFile: IUploadFileDocument = new UploadModel(fileData);

    uploadFile
      .save()
      .then((fileObj: IUploadFile) => {
        res.json({
          status: "success",
          file: fileObj,
        });
      })
      .catch((err: any) => {
        res.json({
          status: "error",
          message: err,
        });
      });
  };

  delete = (req: express.Request, res: express.Response): void => {
    const fileId: string = req.user.userId;
    UploadModel.deleteOne({ _id: fileId }, function (err: any) {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: err,
        });
      }
      res.json({
        status: "success",
      });
    });
  };
}

export default UploadController;
