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

router.patch(
  "/update_profile",
  authenticate,
  role_allowed("PATIENT"),
  patient_controller.update_patient_profile,
);

router.get(
  "/health-records",
  authenticate,
  role_allowed("PATIENT", "DOCTOR", "HOSPITAL"),
  patient_controller.get_health_records,
);

router.get(
  "/health-records/:id",
  authenticate,
  role_allowed("PATIENT", "DOCTOR", "HOSPITAL"),
  patient_controller.get_health_record,
);

router.get(
  "/doctors",
  authenticate,
  role_allowed("PATIENT"),
  patient_controller.get_available_doctors,
);

export default router;
