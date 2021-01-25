import { Schema, Document, model, Types } from "mongoose";
import { IDialog } from "./Dialog";
import { isEmail } from "validator";
import moment from "moment-timezone";

export interface IUser extends Document {
  key: IDialog[];
  username: string;
  email: string;
  name: string;
  password: string;
  dialog: IDialog | null;
  contacts: Array<Types.ObjectId>;
  avatar: string;
  confirmed: boolean;
  confirm_hash: string;
  last_seen: Date;
  data?: IUser;
  createdAt: Date;
  updatedAt: Date;
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
    contacts: [{ type: Types.ObjectId }],
    dialog: { type: Types.ObjectId, ref: 'Dialog' },
    avatar: String,
    confirmed: {
      type: Boolean,
      default: false,
    },
    confirm_hash: String,
    last_seen: {
      type: Date,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    }
  }
);

UserSchema.pre<IUser>('save', function (next) {
  const dateKiev = moment.tz(Date.now(), "Europe/Kiev").toDate();
  this.updatedAt = dateKiev;
  this.last_seen = dateKiev;
  if ( !this.createdAt ) {
    this.createdAt = dateKiev;
  }
  next();
});

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;


