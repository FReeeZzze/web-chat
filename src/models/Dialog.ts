import { Schema, Document, model, Types } from "mongoose";

export interface IDialog extends Document {
  users: Array<Object>;
  messages: Array<Object>;
}

const DialogSchema: Schema = new Schema(
  {
    users: [{ type: Types.ObjectId, ref: 'User' }],
    messages: [{ type: Types.ObjectId, ref: 'Message' }]
  },
  {
    timestamps: true,
  }
);

const DialogModel = model<IDialog>("Dialog", DialogSchema);

export default DialogModel;

