import { Schema, Document, model, Types } from "mongoose";
import { IUser } from "./User";

export interface IMessage extends Document {
  from: IUser;
  message: string;
}

const MessageSchema: Schema = new Schema(
  {
    from: {
      type: Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = model<IMessage>("Message", MessageSchema);

export default MessageModel;
