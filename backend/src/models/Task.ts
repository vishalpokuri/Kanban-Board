import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  content: string;
  createdAt: Date;
}

const taskSchema = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Task = mongoose.model<ITask>("Task", taskSchema);