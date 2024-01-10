const cors = require("cors"),
  bodyParser = require("body-parser"),
  express = require("express"),
  mongoose = require("mongoose"),
  swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");
config = require("./config");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Backend",
      version: "0.1.0",
      description: "Backend test",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          value: "Bearer <JWT token here>",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

var server = express();

const corsOptions = {
  origins: ["*"],
  allowHeaders: ["Content-Type", "Content-Length", "Authorization"],
};

server.use(cors(corsOptions));
server.use(require("morgan")("dev"));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
server.listen(config.serverSettings.port, () => {
  console.log(`---${config.name} Service ---`);
  console.log(`Connecting to ${config.name} repository...`);

  const mongoOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    reconnectTries: 5,
    reconnectInterval: 500,
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
    console.log(`Server started succesfully, running on port: ${config.serverSettings.port}.`);
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

module.exports = server;
