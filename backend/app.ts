import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import * as auth_route from "./routes/auth_route.ts";
import { load_model } from "./ml/predict.ts";

const app = express();
load_model();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.get("/test", (req, res) => {
  res.status(200).json({ message: "test route working" });
});

export default app;
