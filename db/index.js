const DbController = require("../controllers/DbController");
const path = require("path");

module.exports = new DbController(path.join(__dirname, "../db/db.json"));
