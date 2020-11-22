import { Schema, Document, model, Types } from "mongoose";
import { IDialog } from "./Dialog";
import { isEmail } from "validator";

export interface IUser extends Document {
  username: string;
  email: string;
  name: string;
  password: string;
  dialogs: IDialog[];
  avatar: string;
  confirmed: boolean;
  confirm_hash: string;
  last_seen: Date;
  data?: IUser;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      validate: [isEmail, "Invalid email"],
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    dialogs: [{ type: Types.ObjectId, ref: 'Dialog'}],
    avatar: String,
    confirmed: {
      type: Boolean,
      default: false,
    },
    confirm_hash: String,
    last_seen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Для задания начального USERNAME, которое потом пользователь сможет поменять
UserSchema.pre<IUser>('save', function (next) {
  this.username = `@${this.get('name')}_${Math.floor (Math.random () * 90000) + 10000}`;
  next();
});

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;


