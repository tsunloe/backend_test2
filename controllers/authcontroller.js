const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const config = require("../config");
const jwt = require("jsonwebtoken");

class authController {
  register = async (req, res) => {
    try {
      const { username, password, usercontact } = req.body;
      const email = usercontact.phoneNumber;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const existingUser = await User.findOne({
        $or: [{ username: username }, { "usercontact.phoneNumber": email }],
      });

      if (existingUser) {
        return res.status(409).json({ error: "Username or Phone number already exists" });
      }

      const privateKey = config.tokenSettings.privateKey;
      const accessTokenExpiry = config.tokenSettings.privateAccessTokenExpiry;
      const refreshTokenExpiry = config.tokenSettings.privateRefreshTokenExpiry;

      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        ...req.body,
        password: hashedPassword,
        role: "user",
      };

      const user = new User(userData);
      await user.save();

      const token = jwt.sign({ userId: user._id }, privateKey, { expiresIn: accessTokenExpiry });
      const refreshToken = jwt.sign({ userId: user._id }, privateKey, { expiresIn: refreshTokenExpiry });

      res.status(201).json({ message: "User registered successfully", accessToken: token, refreshToken: refreshToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  register_emp = async (req, res) => {
    try {
      const { username, password, usercontact, picture, hidddenpicture } = req.body;
      const email = usercontact.phoneNumber;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (!picture || !Array.isArray(picture) || picture.length === 0) {
        return res.status(400).json({ error: "At least one picture is required" });
      }

      if (!hidddenpicture || !Array.isArray(hidddenpicture) || hidddenpicture.length === 0) {
        return res.status(400).json({ error: "At least one hidden picture is required" });
      }

      const existingUser = await User.findOne({
        $or: [{ username: username }, { "usercontact.phoneNumber": email }],
      });

      if (existingUser) {
        return res.status(409).json({ error: "Username or Phone number already exists" });
      }

      const privateKey = config.tokenSettings.privateKey;
      const accessTokenExpiry = config.tokenSettings.privateAccessTokenExpiry;
      const refreshTokenExpiry = config.tokenSettings.privateRefreshTokenExpiry;

      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        ...req.body,
        password: hashedPassword,
        role: "dek",
      };

      const user = new User(userData);
      await user.save();

      const token = jwt.sign({ userId: user._id }, privateKey, { expiresIn: accessTokenExpiry });
      const refreshToken = jwt.sign({ userId: user._id }, privateKey, { expiresIn: refreshTokenExpiry });

      res.status(201).json({ message: "Dek registered successfully", accessToken: token, refreshToken: refreshToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  login = async (req, res) => {
    try {
      const data = req.body;
      const username = data.username;
      const password = data.password;
      const phoneNumber = data.phoneNumber;
      const expire = data.stay_loggedin ? "30d" : config.tokenSettings.privateAccessTokenExpiry;

      let user;

      if (data.type === "p") {
        user = await this.findUserByUsernameOrPhoneNumber(null, phoneNumber);
      } else {
        user = await this.findUserByUsernameOrPhoneNumber(username, null);

        if (!user || (data.type !== "p" && !(await this.isPasswordValid(user, password)))) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
      }

      user.token_version += 1;
      await user.save();

      const accessToken = jwt.sign({ userId: user._id, token_version: user.token_version }, config.tokenSettings.privateKey, { expiresIn: expire });
      const refreshToken = jwt.sign({ userId: user._id }, config.tokenSettings.privateKey, { expiresIn: config.tokenSettings.privateRefreshTokenExpiry });

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getUserData = async (req, res) => {
    const { userId } = req.jwtDecode;

    try {
      const user = await User.findById(userId)
        .select(" -__v -password")
        .exec();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let response = {
        username: user.username,
        avatar: user.avatar,
        balance: user.credit_balance,
        booking : [],
        history : [],
      };

      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  findUserByUsernameOrPhoneNumber = async (username, phoneNumber) => {
    return await User.findOne({ $or: [{ username: username }, { "usercontact.phoneNumber": phoneNumber }] });
  };

  isPasswordValid = async (user, password) => {
    return await bcrypt.compare(password, user.password);
  };
}

module.exports = new authController();
