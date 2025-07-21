import mongoose, { Schema, Document, Types } from "mongoose";

export interface IToken extends Document {
  token: string;
  user: Types.ObjectId;
  purpose: "confirmation" | "reset";
  createdAt: Date;
}

const tokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  purpose: {
    type: String,
    enum: ["confirmation", "reset"],
    required: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: "10m",
  },
});

const Token = mongoose.model<IToken>("Token", tokenSchema);
export default Token;
