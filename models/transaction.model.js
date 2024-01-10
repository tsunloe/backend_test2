const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  booking_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dek_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  credit: { type: Number },
  fee: { type: Number },
  amount: { type: Number },
  start_time: {
    type: Date,
  },
  end_time: {
    type: Date,
  },
  status: {
    type: Number,
  },
  location: {
    lat: { type: String, default: "" },
    long: { type: String, default: "" },
  },
  create_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  remark: { type: String, default: "" },
});

const Transaction = mongoose.model("Transaction", TransactionSchema, "transaction");

module.exports = Transaction;
