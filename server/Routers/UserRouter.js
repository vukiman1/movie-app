import express from "express";
import {
  addLikedMovie,
  changeUserPassword,
  deleteLikedMovie,
  deleteUserProfile,
  deleteUsers,
  getLikedMovies,
  getUsers,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../Controllers/UserControllers.js";
import { admin, protect } from "../middlewares/Auth.js";

const router = express.Router();

//***************PUBLIC ROUTERS ************/
router.post("/", registerUser);
router.post("/login", loginUser);

//***************Private Routes************
router.put("/", protect, updateUserProfile);
router.delete("/", protect, deleteUserProfile);
router.put("/password", protect, changeUserPassword);
router.get("/favorites", protect, getLikedMovies);
router.post("/favorites", protect, addLikedMovie);
router.post("/favorites", protect, deleteLikedMovie);

//************************ADMIN ROUTERS ************************
router.get("/", protect, admin, getUsers);
router.delete("/:id", protect, admin, deleteUsers);

export default router;
