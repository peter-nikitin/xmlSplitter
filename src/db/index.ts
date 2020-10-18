import path from "path";
import DbController from "../controllers/DbController";

const dbController = new DbController(path.join(__dirname, "../db/db.json"));

export default dbController;
