import http from "http";

import app from "./app";

import scheduleCroJobsFromDb from "./cron/scheduleCroJobsFromDb";

scheduleCroJobsFromDb();
const port = process.env.PORT || 8080;
app.set("port", port);
const server = http.createServer(app);
server.listen(port);

server.on("listening", () => console.log(`Listen on http://localhost:${port}`));
