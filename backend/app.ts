import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth_route from "./routes/auth_route.ts";
import doctor_route from "./routes/doctor_route.ts";
import patient_route from "./routes/patient_route.ts";
import diagnosis_route from "./routes/diagnosis_route.ts";
import appointment_route from "./routes/appointment_route.ts";
import admin_route from "./routes/admin_route.ts";

const app = express();

const allowed_origins = [process.env.CLIENT_URL, "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed_origins.includes(origin)) return callback(null, true);
      return callback(new Error("Blocked by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get("/test", (req, res) => {
  res.status(200).json({ message: "test route working" });
});

app.use("/api/auth", auth_route);
app.use("/api/doctor", doctor_route);
app.use("/api/patient", patient_route);
app.use("/api", diagnosis_route);
app.use("/api/appointment", appointment_route);
app.use("/api/admin", admin_route);

export default app;
