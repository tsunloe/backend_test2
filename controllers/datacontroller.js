const User = require("../models/user.model");
const UserRate = require("../models/user_rate.model");
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
          // Assuming Data is a Mongoose model
          const newData = new Data(row);
          results.push(await newData.save());
        })
        .on("end", () => {
          console.log("CSV file successfully processed and imported into MongoDB");
          // Do something with results if needed
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  addCredit = async (req, res) => {
    const { userId } = req.jwtDecode;
    const { credit } = req.body;
    console.log("credit", credit);
    // return false;
    try {
      const user = await User.findById(userId).select(" -__v -password").exec();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.credit_balance += credit;

      await user.save();

      let response = {
        username: user.username,
        credit_balance: user.credit_balance,
      };

      res.status(201).json({ message: "Add Credit Successful", response: response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  favoriteUser = async (req, res) => {
    try {
      const { userId } = req.jwtDecode;
      const { favorite_user_id } = req.body;

      const getUser = await User.findById(userId).select("favorite username");
      if (!getUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const favUser = await User.findById(favorite_user_id).select("username").where("role").equals("dek");
      if (!favUser) {
        return res.status(404).json({ error: "User is not dek" });
      }
      const foundFavorite = getUser.favorite.find((item) => item.user_id === favorite_user_id);

      let message = "";
      if (foundFavorite) {
        message = "Unfavorite " + favUser.username + "Success";

        await User.updateOne({ _id: userId }, { $pull: { favorite: { user_id: favorite_user_id } } });
      } else {
        message = "favorite " + favUser.username + " Success";
        ///push Fav

        const userDataFollow = {
          user_id: favUser._id,
          username: favUser.username,
        };
        await User.updateOne({ _id: userId }, { $push: { favorite: userDataFollow } });
      }

      res.status(201).json({ message: message, status: 1 });
    } catch (error) {
      console.error("error message", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  showAllDek = async (req, res) => {
    try {
      const { userId } = req.jwtDecode;
      const { favorite_user_id } = req.body;

      const getUser = await User.findById(userId).select("favorite username");
      if (!getUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const favDek = getUser.favorite;

      const Alldek = await User.find({ role: "dek" }).select("_id username");

      const item_after_sort = [];

      favDek.forEach((fav) => {
        const matchingUser = Alldek.find((user) => user._id.toString() === fav.user_id);

        if (matchingUser) {
          item_after_sort.push(matchingUser);
        }
      });

      Alldek.forEach((user) => {
        if (!favDek.some((fav) => fav.user_id === user._id.toString())) {
          item_after_sort.push(user);
        }
      });

      res.status(200).json({ result: item_after_sort, status: 1 });
    } catch (error) {
      console.error("error message", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  showDekById = async (req, res) => {
    try {
      const { userId } = req.jwtDecode;
      const dek_id = req.params.user_id;
      let showhidden = false;
      let average = 0;

      const user_data = await User.findById(dek_id).select("age avatar banner tag username picture hidddenpicture usercontact");
      if (!user_data) {
        return res.status(401).json({ error: "User not found" });
      }

      const checkpaid = await User.findById(userId).select("username paid");
      if (!checkpaid) {
        return res.status(401).json({ error: "Login User not found" });
      }
      let havePaid = checkpaid.paid.find((item) => item.user_id == dek_id);
      if (havePaid) {
        showhidden = true;
      }

      const rating = await UserRate.findOne({ user_id: dek_id })
        .populate({
          path: "rate.transaction_id",
          select: "booking_user status",
          populate: {
            path: "booking_user",
            model: "User",
            select: "username usercontact avatar",
          },
        })
        .exec();

      const ratingArray = rating.rate;

      if (ratingArray.length > 0) {
        const sum = ratingArray.reduce((total, item) => total + item.rate, 0);
        average = sum / ratingArray.length;
      }

      const response_data = {
        ...user_data.toObject(),
        showhidden,
        rating: ratingArray,
        star: average || 0,
      };

      res.status(200).json({ result: response_data, status: 1 });
    } catch (error) {
      console.error("error message", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  buyHidden = async (req, res) => {
    try {
      const { userId } = req.jwtDecode;
      const { dek_id, credit } = req.body;

      const myData = await User.findById(userId).select("username credit_balance paid");

      if (!myData) {
        return res.status(500).json({ error: "Login User not found" });
      }

      if (myData.credit_balance < credit) {
        return res.status(500).json({ error: "Credit not enoung" });
      }

      if (myData.paid.find((item) => item.user_id == dek_id)) {
        return res.status(500).json({ error: "Already Paid For this user" });
      }

      let paidData = {
        user_id: dek_id,
      };
      myData.credit_balance = myData.credit_balance - credit;

      myData.paid = myData.paid || [];

      myData.paid.push(paidData);

      await myData.save();
      res.status(201).json({ message: "Buy Picture Complete", status: 1 });
    } catch (error) {
      console.error("error message", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
module.exports = new datacontroller();
