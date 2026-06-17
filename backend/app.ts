import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import auth_route from "./routes/auth_route.ts";
import doctor_route from "./routes/doctor_route.ts";
import patient_route from "./routes/patient_route.ts";
import diagnosis_route from "./routes/diagnosis_route.ts";
import appointment_route from "./routes/appointment_route.ts";
import admin_route from "./routes/admin_route.ts";
import { load_model } from "./ml/predict.ts";

const app = express();
load_model();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.get("/test", (req, res) => {
  res.status(200).json({ message: "test route working" });
});

// Mount routes
app.use("/api/auth", auth_route);
app.use("/api/doctor", doctor_route);
app.use("/api/patient", patient_route);
app.use("/api", diagnosis_route);
app.use("/api/appointment", appointment_route);
app.use("/api/admin", admin_route);

export default app;
