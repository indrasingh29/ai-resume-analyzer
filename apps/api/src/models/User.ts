import { model, Schema, type HydratedDocument } from "mongoose";

export type User = {
  name: string;
  email: string;
  passwordHash: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
      index: true
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = model<User>("User", userSchema);

export function toPublicUser(user: UserDocument) {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}
