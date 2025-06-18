import mongoose, { Schema, Document } from "mongoose";

export interface IColumn extends Document {
  title: string;
  tasks: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const columnSchema = new Schema({
  title: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: { type: Date, default: Date.now }
});

export const Column = mongoose.model<IColumn>("Column", columnSchema);
