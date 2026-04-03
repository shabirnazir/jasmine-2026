import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((res) => console.log("-------->connected to database--------->"))
      .catch((e) => console.log("Error while connecting", e));
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
  }
};
