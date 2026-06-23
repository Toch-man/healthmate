import "dotenv/config";

// catch any crash and print the real error
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

import { createServer } from "http";
import { init_socket } from "./src/socket.ts";
import app from "./app.ts";
import { load_model } from "./ml/predict.ts";

const http_server = createServer(app);

init_socket(http_server);
load_model();

const PORT = process.env.PORT || 5000;
http_server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});
