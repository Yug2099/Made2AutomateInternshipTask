//import express-async-handler to automaticlly handle async errors
const asyncHandler = require("express-async-handler");
const { OAuth2Client } = require("google-auth-library");
// const User = require("../models/userModel");
// const generateToken = require("../config/generateToken");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  //Check if no value is null
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  //Check if User already exists and perform necessary tasks
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("failed to Create User");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          //Search in name or email and options as i means case sensitive
          //regex in mongodb helps to match the string in the query
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

    const users = await User.findOne(keyword).find({
      //$ne: req.user._id means not equal to the current user and id is to specify the user
      _id: { $ne: req.user._id }
  });
  res.send(users);
});


const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");

const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: "383877989715-odr1dp3akblaeavsmpf0hbqv8gj785nv.apps.googleusercontent.com",
  });

  const { name, email, picture } = ticket.getPayload();

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      pic: picture,
      password: Math.random().toString(36).slice(-8), // Generate a random password for the user
    });
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

module.exports = { registerUser, authUser, allUsers, googleLogin };


// module.exports = { registerUser, authUser, allUsers };
