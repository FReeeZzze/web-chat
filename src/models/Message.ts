import { Schema, Document, model, Types } from "mongoose";

export interface IMessage extends Document {
  from: string;
  to: string;
  dialog: Array<Schema.Types.ObjectId>;
  message: string;
  read: boolean;
  attachments: Array<Schema.Types.ObjectId>;
}

const MessageSchema: Schema = new Schema(
  {
    from: {
      type: Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: Types.ObjectId,
      ref: 'User'
    },
    dialog: { type: Schema.Types.ObjectId, ref: "Dialog", require: true },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachments: [{ type: Schema.Types.ObjectId, ref: "UploadFile" }],
  },
  {
    timestamps: true,
  }
);

const MessageModel = model<IMessage>("Message", MessageSchema);

export default MessageModel;
