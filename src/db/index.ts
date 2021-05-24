import path from "path";
import DbController from "./DbModel";

const dbController = new DbController(path.join(__dirname, "../db/db.json"));

export default dbController;
