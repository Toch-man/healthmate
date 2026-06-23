import "dotenv/config";
import { createServer } from "http";

// test if env is loading
console.log("ENV CHECK:", {
  db: process.env.DATABASE_URL ? "✅ set" : "❌ missing",
  jwt: process.env.JWT_ACCESS_SECRET ? "✅ set" : "❌ missing",
  google: process.env.GOOGLE_CLIENT_ID ? "✅ set" : "❌ missing",
  gemini: process.env.GEMINI_API_KEY ? "✅ set" : "❌ missing",
  port: process.env.PORT || "5000 (default)",
  node_env: process.env.NODE_ENV,
});

import app from "./app.ts";
import { init_socket } from "./src/socket.ts";
import { load_model } from "./ml/predict.ts";

const http_server = createServer(app);
init_socket(http_server);
load_model();

const PORT = process.env.PORT || 5000;
http_server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
