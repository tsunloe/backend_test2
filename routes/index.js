const authController = require("../controllers/authcontroller.js");
const datacontroller = require("../controllers/datacontroller.js");

const { authorise } = require("../untils");

module.exports = (server) => {
  ///Aut
  /**
   * @swagger
   * tags:
   *   name: Auth
   * /api/getJwt:
   *   get:
   *     summary: getJwt
   *     tags: [Auth]
   *     description: Import Data.
   *     responses:
   *       201:
   *         description: Progess Status.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   accessToken:
   *                     type: string
   */
  server.get("/api/getJwt", authController.getJwt);

  ///Data
  /**
   * @swagger
   * tags:
   *   name: Data
   * /api/importcsv:
   *   get:
   *     summary: Import From csv
   *     tags: [Data]
   *     security:
   *       - Authorization: []
   *     description: Import Data.
   *     responses:
   *       201:
   *         description: Progess Status.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   message:
   *                     type: string
   */
  server.get("/api/importcsv", authorise.isAuthen, datacontroller.importcsv);
  /**
   * @swagger
   * tags:
   *   name: Data
   * /api/data:
   *   get:
   *     summary: Get all data
   *     tags: [Data]
   *     security:
   *       - Authorization: []
   *     description: Get Data.
   *     responses:
   *       201:
   *         description: Progess Status.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   message:
   *                     type: string
   *                   data:
   *                     type: array
   */
  server.get("/api/data", authorise.isAuthen, datacontroller.getdata);

  /**
   * @swagger
   * tags:
   *   name: Data
   * /api/data:
   *   post:
   *     summary: Add data
   *     tags: [Data]
   *     security:
   *       - Authorization: []
   *     description: Add Data.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               Seed_RepDate:
   *                 type: string
   *               Seed_Year:
   *                 type: string
   *               Seeds_YearWeek:
   *                 type: string
   *               Seed_Varity:
   *                 type: string
   *               Seed_RDCSD:
   *                 type: string
   *               Seed_Stock2Sale:
   *                 type: string
   *               Seed_Season:
   *                 type: string
   *               Seed_Crop_Year:
   *                 type: string
   *     responses:
   *       201:
   *         description: Progess Status.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   message:
   *                     type: string
   *                   data:
   *                     type: array
   */
  server.post("/api/data", authorise.isAuthen, datacontroller.addData);

  /**
   * @swagger
   * tags:
   *   name: Data
   * /api/data/{id}:
   *   put:
   *     summary: Update data
   *     tags: [Data]
   *     security:
   *       - Authorization: []
   *     description: Update Data.
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               Seed_RepDate:
   *                 type: string
   *               Seed_Year:
   *                 type: string
   *               Seeds_YearWeek:
   *                 type: string
   *               Seed_Varity:
   *                 type: string
   *               Seed_RDCSD:
   *                 type: string
   *               Seed_Stock2Sale:
   *                 type: string
   *               Seed_Season:
   *                 type: string
   *               Seed_Crop_Year:
   *                 type: string
   *     responses:
   *       201:
   *         description: Progess Status.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   message:
   *                     type: string
   *                   data:
   *                     type: array
   */
  server.put("/api/data/:id", authorise.isAuthen, datacontroller.updateData);

  /**
   * @swagger
   * tags:
   *   name: Data
   * /api/data/{id}:
   *   delete:
   *     summary: Delete data
   *     tags: [Data]
   *     security:
   *       - Authorization: []
   *     description: Delete Data.
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: Progess Status.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   message:
   *                     type: string
   */
  server.delete("/api/data/:id", authorise.isAuthen, datacontroller.deleteData);
};
