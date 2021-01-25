import { Schema, Document, model, Types } from "mongoose";
import moment from "moment-timezone";

export interface IDialog extends Document {
  users: Array<Object>;
  messages: Array<Object>;
  updatedAt: Date;
  createdAt: Date;
}

const DialogSchema: Schema = new Schema(
  {
    users: [{ type: Types.ObjectId, ref: 'User' }],
    messages: [{ type: Types.ObjectId, ref: 'Message' }],
    lastMessage: { type: Types.ObjectId, ref: 'Message'},
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    }
  }
);

DialogSchema.pre<IDialog>('save', function (next) {
  const dateKiev = moment.tz(Date.now(), "Europe/Kiev").toDate();
  this.updatedAt = dateKiev;
  if ( !this.createdAt ) {
    this.createdAt = dateKiev;
  }
  next();
});

const DialogModel = model<IDialog>("Dialog", DialogSchema);

export default DialogModel;

