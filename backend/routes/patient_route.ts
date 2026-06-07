import * as patient_controller from "../controllers/patient_controller";
import express from "express";
import { authenticate, role_allowed } from "../middleware/auth_middleware";

const router = express.Router();

router.get(
  "/patient-profile",
  authenticate,
  role_allowed("PATIENT"),
  patient_controller.patient_profile,
);
