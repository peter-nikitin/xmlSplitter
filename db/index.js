const path = require("path");
const DbController = require("../controllers/DbController");

module.exports = new DbController(path.join(__dirname, "../db/db.json"));
