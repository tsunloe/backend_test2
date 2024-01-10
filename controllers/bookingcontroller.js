const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");
const UserRate = require("../models/user_rate.model");

class bookingcontroller {
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

  createTransaction = async (req, res) => {
    try {
      const { userId } = req.jwtDecode;
      const { booking_id, dek_id, amount, start_time, end_time, lat, long } = req.body;
      let fee,
        credit = 0;

      const booking_user = await User.findById(booking_id).select("username credit_balance");

      if (booking_user.credit_balance < amount) {
        return res.status(404).json({ error: "Balance Not Enount" });
      }

      if (amount < 5000) {
        fee = 500;
      } else if (amount < 10000) {
        fee = 1000;
      } else if (amount < 50000) {
        fee = 15000;
      }

      booking_user.credit_balance -= amount;
      booking_user.save();

      credit = amount - fee;

      const transactionData = {
        booking_user: booking_id,
        dek_user: dek_id,
        credit: credit,
        fee: fee,
        amount: amount,
        start_time: start_time,
        end_time: end_time,
        status: 0,
        location: { lat: lat, long: long },
        create_by: userId,
      };

      const transaction = new Transaction(transactionData);
      await transaction.save();

      res.status(200).json({ result: "Create Transaction Success", status: 1 });
    } catch (error) {
      console.error("error message", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  cancelTransaction = async (req, res) => {
    try {
      const { transaction_id, remark } = req.body;

      const transaction_data = await Transaction.find({ _id: transaction_id, status: { $ne: 3 } }).select("amount booking_user");

      if (transaction_data.length === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const booking_user = await User.findById(transaction_data[0].booking_user).select("username credit_balance");

      if (!booking_user) {
        return res.status(404).json({ error: "User not found" });
      }

      booking_user.credit_balance += transaction_data[0].amount;
      await booking_user.save();

      transaction_data[0].remark = remark;
      transaction_data[0].status = 3;
      await transaction_data[0].save();

      res.status(200).json({ result: "Cancel Transaction Success", status: 1 });
    } catch (error) {
      console.error("error message", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  completeTransaction = async (req, res) => {
    try {
      const { transaction_id } = req.body;

      const transaction_data = await Transaction.find({ _id: transaction_id, status: { $ne: 1 } }).select("credit dek_user booking_user");

      if (transaction_data.length === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const booking_user = await User.findById(transaction_data[0].booking_user).select("username user_exp");
      if (!booking_user) {
        return res.status(404).json({ error: "User not found" });
      }
      booking_user.user_exp += 100;
      await booking_user.save();

      const dek_user = await User.findById(transaction_data[0].dek_user).select("username credit_balance");

      if (!dek_user) {
        return res.status(404).json({ error: "User not found" });
      }

      dek_user.credit_balance += transaction_data[0].credit;
      await dek_user.save();

      transaction_data[0].status = 1;
      await transaction_data[0].save();

      res.status(200).json({ result: "Complete Transaction Success", status: 1 });
    } catch (error) {
      console.error("error message", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  rating = async (req, res) => {
    try {
      const { transaction_id, rate, comment } = req.body;
      const transation_data = await Transaction.findById(transaction_id).select("booking_user dek_user");

      if (!transation_data) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      let user_rate = await UserRate.findOne({ user_id: transation_data.dek_user });

      if (!user_rate) {
        const add_data = {
          user_id: transation_data.dek_user,
        };
        user_rate = new UserRate(add_data);
        await user_rate.save();
      }

      const isRating = user_rate.rate.find((item) => item.transaction_id == transaction_id);

      if (isRating) {
        return res.status(404).json({ error: "you already ratin this transaction" });
      }

      const update_rating = {
        transaction_id: transaction_id,
        rate: rate,
        comment: comment,
      };
      await UserRate.updateOne({ user_id: transation_data.dek_user }, { $push: { rate: update_rating } });

      res.status(200).json({ result: "Rateing Success", status: 1 });
    } catch (error) {
      console.error("error message", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
module.exports = new bookingcontroller();
