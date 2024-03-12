import express from "express";
import {
  loginUser,
  registerUser,
  updateUserProfile,
} from "../Controllers/UserControllers.js";
import { protect } from "../middlewares/Auth.js";

const router = express.Router();

//***************PUBLIC ROUTERS ************/
router.post("/", registerUser);
router.post("/login", loginUser);

//***************Private Routes************
router.put("/", protect, updateUserProfile);

export default router;
