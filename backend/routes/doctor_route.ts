import express from "express";
import { authenticate, role_allowed } from "../middleware/auth_middleware.ts";
import * as doctor_controller from "../controllers/doctor_controller.ts";
const router = express.Router();

router.get(
  "/doctor_profile",
  authenticate,
  doctor_controller.get_doctor_profile,
);
router.get(
  "/doctor_patient",
  authenticate,
  role_allowed("DOCTOR"),
  doctor_controller.doctor_patient_profile,
);
router.get("/doctor/:id", authenticate, doctor_controller.get_doctor_by_id);
router.get("/doctors", authenticate, doctor_controller.get_all_doctors);
router.patch(
  "/update_doctor_profile",
  authenticate,
  role_allowed("DOCTOR"),
  doctor_controller.update_doctor_profile,
);

export default router;
