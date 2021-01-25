import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./User";
import { IMessage } from "./Message";
import moment from "moment-timezone";

export interface IUploadFile {
  filename: string;
  size: number;
  ext: string;
  url: string;
  message: IMessage | string;
  user: IUser | string;
  updatedAt: Date;
  createdAt: Date;
}

export type IUploadFileDocument = Document & IUploadFile;

const UploadFileSchema = new Schema(
  {
    filename: String,
    size: Number,
    ext: String,
    url: String,
    timeEnd: String,
    date: String,
    duration: Number,
    message: { type: Schema.Types.ObjectId, ref: "Message", require: true },
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    }
  }
);

UploadFileSchema.pre<IUploadFileDocument>('save', function (next) {
  const dateKiev = moment.tz(Date.now(), "Europe/Kiev").toDate();
  this.updatedAt = dateKiev;
  if ( !this.createdAt ) {
    this.createdAt = dateKiev;
  }
  next();
});

const UploadFileModel = mongoose.model<IUploadFileDocument>(
  "UploadFile",
  UploadFileSchema
);

export default UploadFileModel;
