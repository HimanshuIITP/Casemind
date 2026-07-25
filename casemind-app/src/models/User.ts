import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  role: "CITIZEN" | "LAWYER" | "COURT";
  phoneNumber?: string;
  barCouncilNumber?: string;
  courtId?: string;
  twoFactorEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Optional for Google OAuth in the future
    },
    name: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["CITIZEN", "LAWYER", "COURT"],
      required: true,
    },
    // Citizen specific
    phoneNumber: {
      type: String,
      required: function (this: IUser) {
        return this.role === "CITIZEN";
      },
    },
    // Lawyer specific
    barCouncilNumber: {
      type: String,
      required: function (this: IUser) {
        return this.role === "LAWYER";
      },
    },
    // Court specific
    courtId: {
      type: String,
      required: function (this: IUser) {
        return this.role === "COURT";
      },
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
