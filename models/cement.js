import mongoose, { Schema, models } from "mongoose";

const cementSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    distributor: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    fair: {
      type: Number,
    },
    chalan: {
      type: String,
    },
    detail: {
      type: String,
    },
    truckNumber: {
      type: String,
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
  { timestamps: true }
);

const Cement = models.Cement || mongoose.model("Cement", cementSchema);
export default Cement;
