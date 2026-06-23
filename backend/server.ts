import "dotenv/config";
import { createServer } from "http";
import { init_socket } from "./src/socket.ts";
import app from "./app.ts";
import { load_model } from "./ml/predict.ts";

console.log(1);
const http_server = createServer(app);

// attach socket.io to the http server
console.log(2);
init_socket(http_server);

// load TF model
console.log(3);
load_model();

console.log(4);

const PORT = process.env.PORT || 5000;
http_server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});
