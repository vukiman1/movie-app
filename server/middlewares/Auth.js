// @desc authenticated user and generate a token
import asyncHandler from "express-async-handler";
import User from "../Models/UserModels.js";
import jwt from "jsonwebtoken";
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d", // expires in 30 day
  });
};

//prodtection middleware
const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //set  token Bearer in headers
    try {
      token = req.headers.authorization.split(" ")[1];

      //verify token and get user id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //fin user in decored token
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      console.log(err);
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

export { generateToken, protect };
