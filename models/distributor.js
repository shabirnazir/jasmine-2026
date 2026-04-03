import mongoose, { Schema, models } from "mongoose";

const distributorSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Distributor =
  models.Distributor || mongoose.model("Distributor", distributorSchema);
export default Distributor;
