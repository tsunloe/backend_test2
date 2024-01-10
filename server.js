const cors = require("cors"),
  bodyParser = require("body-parser"),
  express = require("express"),
  mongoose = require("mongoose"),
  config = require("./config");


var server = express();

const corsOptions = {
  origins: ["*"],
  allowHeaders: ["Content-Type", "Content-Length", "Authorization"]
};

server.use(cors(corsOptions));
server.use(require("morgan")("dev"));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.listen(config.serverSettings.port, () => {
  console.log(`---${config.name} Service ---`);
  console.log(`Connecting to ${config.name} repository...`);

  const mongoOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    reconnectTries: 5,
    reconnectInterval: 500
  };

  mongoose.Promise = global.Promise;
  mongoose.connect(config.dbSettings.url, mongoOptions);
  

  const db = mongoose.connection;

  db.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  db.once("open", () => {
    console.log("Connected. Starting Server");
    require("./routes")(server);
    console.log(
      `Server started succesfully, running on port: ${config.serverSettings.port}.`
    );
  });

  db.once("reconnected", () => {
    console.log("MongoDB reconnected!");
  });

  db.once("disconnected", () => {
    console.log("MongoDB disconnected!");
    mongoose.connect(config.dbSettings.url, mongoOptions);
  });
});

process.on("SIGINT", () => {
  process.exit(0);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log(`Closing ${config.name} Service.`);
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log("Server closed.");

    mongoose.connection.close(false, () => {
      console.log("MongoDb connection closed.");
      process.exit(0);
    });
  });
});

// Schedule the cron job to run every 10 seconds
// cron.schedule("*/10 * * * * *", cronController.updateRealTimeData);

// Schedule the cron job to run at midnight (00:00) every day
// cron.schedule("0 7 * * *", FootballController.addTodaySchedu);
// cron.schedule("0 8 * * *", FootballController.addTodayBetting);
// cron.schedule("0 7 * * *", QuestController.resetQuest);

module.exports = server;
