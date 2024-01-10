const mongoose = require("mongoose");

const userRateSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rate: [
    {
      transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
      rate: { type: Number, default: 1 },
      comment: { type: String, default: "" },
      create_time: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const UserRate = mongoose.model("UserRate", userRateSchema, "user_rate");

module.exports = UserRate;
