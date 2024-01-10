const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  usercontact: {
    address: String,
    email: String,
    phoneNumber: { type: String, required: true, unique: true },
  },
  registration_date: { type: Date, default: Date.now },
  birth_date: Date,
  credit_balance: { type: Number, default: 0 },
  token_version: { type: Number, default: 0 },
  user_rank: {
    name: String,
    img: String,
  },
  user_exp: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  avatar: { type: String, default: "noimage.png" },
  banner: { type: String, default: "noimage.png" },
  picture: [
    {
      url: String,
    },
  ],
  hidddenpicture: [
    {
      url: String,
    },
  ],
  video: {
    url: String,
  },
  is_admin: { type: Boolean, default: false },
  role: String,
  active: {
    days: [String],
    times: [String],
    status: { type: Boolean, default: false },
    verify: { type: Boolean, default: false },
  },
  paid: [
    {
      user_id: String,
    },
  ],
  tag: [],
  favorite: [
    {
      user_id: { type: String, default: "" },
      username: { type: String, default: "" },
    },
  ],
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
