const authController = require("../controllers/authcontroller.js");
const datacontroller = require("../controllers/datacontroller.js");

const { authorise } = require("../untils");


module.exports = (server) => {
  server.post("/api/register_user", authController.register);
  server.post("/api/register_emp", authController.register_emp);
  server.post("/api/login", authController.login);
  server.get("/api/getuser", authorise.isAuthen, authController.getUserData);

  ///Data
  server.get("/api/importcsv", datacontroller.importcsv);

  
};
