import * as patient_controller from "../controllers/patient_controller.ts";
import express from "express";
import { authenticate, role_allowed } from "../middleware/auth_middleware.ts";

const router = express.Router();

router.get(
  "/patient_profile",
  authenticate,
  role_allowed("PATIENT"),
  patient_controller.patient_profile,
);

// patient_route.ts
router.get(
  "/health-records",
  authenticate,
  role_allowed("PATIENT"),
  patient_controller.get_health_records,
);
//comlete this route using the ones in the UI
//update_profile
//records

export default router;
