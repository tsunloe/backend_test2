const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  Seed_RepDate: { type: String},
  Seed_Year: { type: String },
  Seeds_YearWeek: { type: String },
  Seed_Varity: { type: String },
  Seed_RDCSD: { type: String },
  Seed_Stock2Sale: { type: String },
  Seed_Season: { type: String },
  Seed_Crop_Year: { type: String },
});

const Data = mongoose.model("Data", dataSchema, "data");

module.exports = Data;
