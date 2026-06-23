import "dotenv/config";
import { createServer } from "http";
import { init_socket } from "./src/socket.ts";
import app from "./app.ts";
import { load_model } from "./ml/predict.ts";

const http_server = createServer(app);

// attach socket.io to the http server
init_socket(http_server);

// load TF model
load_model();

const PORT = process.env.PORT || 5000;
http_server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});
