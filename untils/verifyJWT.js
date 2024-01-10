const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/user.model");

module.exports.isAuthen = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !(authorization.search("Bearer ") === 0)) {
      return res.send({ message: "Missing Authorization Header" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return next(new Error("Missing Bearer Token"));
    }

    try {
      const decoded = jwt.verify(token, config.tokenSettings.publicKey);
      req.jwtDecode = decoded;

      const getUser = await User.findOne({ _id: req.jwtDecode.userId });
      if(getUser.token_version !== req.jwtDecode.token_version){
        res.statusCode = 401;
        return res.send({ message: "Invalid Access Token" });
      }

    } catch (err) {
      res.statusCode = 401;
      return res.send({ message: "Invalid Access Token" });
    }
    next();
  } catch (error) {
    res.status(500).send({ message: "Invalid Access Token" });
  }
};

module.exports.isAdmin = async (req, res, next) => {
  try {
    await this.isAuthen(req, res, async () => {
      const user = await User.findOne({ _id: req.jwtDecode.userId });
      
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      if (user.is_admin) {
        next();
      } else {
        res.status(403).send({ message: "Access denied. You are not an admin" });
      }
    });
  } catch (error) {
    console.log('error',error);
    res.status(500).send({ message: "Internal server error" });
  }
};
