import express from "express";
import dotenv from "dotenv";
import dbConnet from "./config/database.js";
import userRouter from "./routes/userRouter.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/user", userRouter);

const starServer = async () => {
  try {
    await dbConnet();
    app.listen(process.env.PORT, () => {
      console.log(`Server is listening on Port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

starServer();
