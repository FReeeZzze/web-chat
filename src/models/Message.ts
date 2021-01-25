import { Schema, Document, model, Types } from "mongoose";
import moment from "moment-timezone";

export interface IMessage extends Document {
  from: string;
  to: string;
  dialog: Array<Schema.Types.ObjectId>;
  message: string;
  read: boolean;
  attachments: Array<Schema.Types.ObjectId>;
  updatedAt: Date;
  createdAt: Date;
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
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachments: [{ type: Schema.Types.ObjectId, ref: "UploadFile" }],
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    }
  },
);

MessageSchema.pre<IMessage>('save', function (next) {
  const dateKiev = moment.tz(Date.now(), "Europe/Kiev").toDate();
  this.updatedAt = dateKiev;
  if ( !this.createdAt ) {
    this.createdAt = dateKiev;
  }
  next();
});

const MessageModel = model<IMessage>("Message", MessageSchema);

export default MessageModel;
