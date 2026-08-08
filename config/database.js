import mongoose from "mongoose";

async function dbConnet() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URL is missing");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to Database Successfully");
}

export default dbConnet;
