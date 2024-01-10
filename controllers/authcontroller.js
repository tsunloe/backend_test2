const config = require("../config");
const jwt = require("jsonwebtoken");

class authController {
  getJwt = async (req, res) => {
    try {
      const expire = config.tokenSettings.privateAccessTokenExpiry;

      const accessToken = jwt.sign({}, config.tokenSettings.privateKey, { expiresIn: expire });
      const refreshToken = jwt.sign({}, config.tokenSettings.privateKey, { expiresIn: config.tokenSettings.privateRefreshTokenExpiry });

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

module.exports = new authController();
