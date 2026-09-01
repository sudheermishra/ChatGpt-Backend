import User from "../model/userSchema.js";

const loadUserMiddleware = async (req, resp, next) => {
  try {
    const id = req.userId;
    const existingUser = await User.findById({ _id: id });
    if (!existingUser) {
      return resp.status(404).json({
        message: "User doesn't exists",
      });
    }

    req.user = existingUser;
    next();
  } catch (error) {
    console.log("Load user error:", error);
    return resp.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default loadUserMiddleware;
