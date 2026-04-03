import mongoose, { Schema, models } from "mongoose";

const recordSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    fair: {
      type: Number,
      default: 0,
    },
    bags: {
      type: Number,
    },
    paid: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
    },
    balance: {
      type: Number,
    },
    month: {
      type: String,
    },
    year: {
      type: String,
    },
  },
  { timestamps: true },
);

const Record = models.Record || mongoose.model("Record", recordSchema);
export default Record;
