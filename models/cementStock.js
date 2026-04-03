import mongoose, { Schema, models } from "mongoose";

const stockSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Stock = models.Stock || mongoose.model("Stock", stockSchema);
export default Stock;
