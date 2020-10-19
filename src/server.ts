import http from "http";

import app from "./app";

import "./utils/cron";

const port = process.env.PORT || 8080;

// console.log(cron);

app.set("port", port);

const server = http.createServer(app);

server.listen(port);

server.on("listening", () => console.log(`Listen on http://localhost:${port}`));
