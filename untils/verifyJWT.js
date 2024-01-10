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

      if(!decoded){
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
