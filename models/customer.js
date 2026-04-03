import mongoose, { Schema, models } from "mongoose";

const customerSchema = new Schema(
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

const Customer = models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
