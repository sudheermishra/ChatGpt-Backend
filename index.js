import express from "express";
import dotenv from "dotenv";
import dbConnet from "./config/database.js";
dotenv.config();
const app = express();

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
