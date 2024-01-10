const Data = require("../models/data.model");
const fs = require("fs");
const csv = require("csv-parser");

// D:\Samak\backend_test\public\csv\37176ff3-dd70-4f1f-8e1d-83eda3cf77e4.csv

class datacontroller {
  importcsv = async (req, res) => {
    try {
      const results = [];
      fs.createReadStream("public/csv/37176ff3-dd70-4f1f-8e1d-83eda3cf77e4.csv")
        .pipe(csv())
        .on("data", async (row) => {
          const newData = new Data(row);
          results.push(await newData.save());
        })
        .on("end", () => {
          res.status(201).json({ message: "CSV file successfully processed and imported into MongoDB" });
        });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };

  getdata = async (req, res) => {
    try {
      const data = await Data.find();
      if (data != 0) {
        res.status(201).json({ message: "Success", data });
      } else {
        res.status(201).json({ message: "Data not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };

  addData = async (req, res) => {
    try {
      const newData = req.body;

      const addData = new Data(newData);

      await addData.save();

      res.status(201).json({ message: "Add data success", data: addData });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };

  updateData = async (req, res) => {
    try {
      const dataId = req.params.id;
      const updateData = req.body;

      await Data.updateOne(
        { _id: dataId },
        {
          $set: {
            Seed_RepDate: updateData.Seed_RepDate,
            Seed_Year: updateData.Seed_Year,
            Seeds_YearWeek: updateData.Seeds_YearWeek,
            Seed_Varity: updateData.Seed_Varity,
            Seed_RDCSD: updateData.Seed_RDCSD,
            Seed_Stock2Sale: updateData.Seed_Stock2Sale,
            Seed_Season: updateData.Seed_Season,
            Seed_Crop_Year: updateData.Seed_Crop_Year,
          },
        }
      );

      res.status(201).json({ message: "Update data success" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };

  deleteData = async (req, res) => {
    try {
      const dataId = req.params.id;

      const findItem = await Data.findById(dataId);
      if (!findItem) {
        res.status(500).json({ message: "Data not found" });
      }
      await findItem.remove();

      res.status(201).json({ message: "Delete data success" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };
}
module.exports = new datacontroller();
