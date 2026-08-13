import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

const authUserMiddleware = async (req, resp, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return resp.status(401).json({ message: "Please Login First" });
    }

    // token verified
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // check that token is related toh this user id or not
    // existingUser will store all the information os this user id
    const existingUser = await User.findById({ _id: payload.id });

    // if id is not match with payload id then user is not related to this token
    if (!existingUser) {
      return resp.status(400).json({
        message: "User Doesn't Exists",
      });
    }

    // if user exists then call the next function means it will access the routes
    // but we can pass information of existingUser in req object
    // we create a user key in req object and pass the information of exisitngUser in it
    req.user = existingUser;
    next();
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
};
