import asyncHandler from "express-async-handler";
import User from "../Models/UserModels.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middlewares/Auth.js";
// @desc Rigister user
// @route  POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, image } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      image,
    });

    //if user created successfully sent user data and token to client
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc Login user
// @route POST /api/users/login
// @access Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    // find user in database
    const user = await User.findOne({ email });
    // if user exists compare password with hashed password then send user data and token to client
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// *********PRIVATE CONTROLLERS ****************
// @desc get user profile
// @route PUT /api/úe/profile
// @access Private

const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, email, image } = req.body;
  try {
    //find user in db (findById)
    const user = await User.findById(req.user._id);

    //if user exists
    if (user) {
      //update user
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.image = image || user.image;
      const updateUser = await user.save();

      //send update user data & token to client
      res.json({
        _id: updateUser._id,
        fullName: updateUser.fullName,
        email: updateUser.email,
        image: updateUser.image,
        isAdmin: updateUser.isAdmin,
        token: generateToken(updateUser._id),
      });
    }
    // else send error message
    else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc Delete user
// @route DELETE /api/users
// @asses private
const deleteUserProfile = asyncHandler(async (req, res) => {
  try {
    // const user = await User.findById(req.user._id);
    // console.log(user);
    // await user.remove();

    //find user in db (findById)
    const user = await User.findById(req.user._id);
    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Can't delete admin user");
      }
      //else delete user from DB
      await user.deleteOne();
      res.json({ message: "User deleted successfully" });
    }

    // else send error message
    else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc change password
// @route PUT /api/users/password
// @access private

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    //find user in db (findById)
    const user = await User.findById(req.user._id);
    // if user exist compare old password with hashed password then update user password and save it in Db
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      //hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();
      res.json({ message: "Password changed successfully" });
    } else {
      res.status(400).json({ message: "Invalid old password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc get all liked movies
// route get /api/user/favorites
// access private

const getLikedMovies = asyncHandler(async (req, res) => {
  try {
    //find user in DB
    const user = await User.findById(req.user._id).populate("likedMovies");

    //if user exists send live movies to client
    if (user) {
      res.json(user.likedMovies);
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc add moive to liked movies
// @route POST /api/user/favorites
// @access private
const addLikedMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.body;
  try {
    //find user in DB
    const user = await User.findById(req.user._id);
    //if user exists add movie to liked movies
    if (user) {
      // check if movie already liked
      // if movie already liked send error massage
      if (user.likedMovies.includes(movieId)) {
        res.status(400);
        throw new Error("Movie already liked");
      }
      // else add movie to liked movies
      user.likedMovies.push(movieId);
      await user.save();
      res.json(user.likedMovies);
    }
    // else send errror message
    else {
      res.status(400);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc delete all movie from liked movies
// @route DELETE /api/users/favorites
// @access private

const deleteLikedMovie = asyncHandler(async (req, res) => {
  try {
    //find user in DB
    const user = await User.findById(req.user._id);
    //if user exists delete movie from liked movies
    if (user) {
      user.likedMovies = [];
      await user.save();
      res.json({ message: "All liked movies deleted successfully" });
    }
    // else send errror message
    else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//**************ADMIN CONTROLLERS******************* */
// @desc Get all users
// @route GET /api/users
// @access private/admin

const getUsers = asyncHandler(async (req, res) => {
  try {
    // find all users in DB
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc Delete users
// @route DELETE /api/users/:id
// @access private/admin

const deleteUsers = asyncHandler(async (req, res) => {
  try {
    // find user in DB
    const user = await User.findById(req.params.id);
    // if user exists delete user from DB
    if (user) {
      // if user is admin throw error message
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Can't delete admin user");
      }
      //else delete user from DB
      await user.deleteOne();
      res.json({ message: "User deleted successfully" });
    }
    // else send error message
    else {
      res.status(400);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
  changeUserPassword,
  getLikedMovies,
  addLikedMovie,
  deleteLikedMovie,
  getUsers,
  deleteUsers,
};
