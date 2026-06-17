import express from "express";
import { authenticate, role_allowed } from "../middleware/auth_middleware.ts";
import * as appointment_controller from "../controllers/appointment.ts";

const router = express.Router();

router.post(
  "/book_appointment/:doctor_id",
  authenticate,
  role_allowed("PATIENT"),
  appointment_controller.book_appointment,
);
router.get(
  "/patient_appointments",
  authenticate,
  role_allowed("PATIENT"),
  appointment_controller.get_patient_appointment,
);
router.get(
  "/doctor_appointments/:doctor_id",
  authenticate,
  role_allowed("DOCTOR"),
  appointment_controller.get_doctor_appointment,
);
router.get(
  "/appointment/:id",
  authenticate,
  appointment_controller.get_appointment,
);
router.delete(
  "/cancel_appointment/:id",
  authenticate,
  appointment_controller.cancel_appointment,
);
router.post(
  "/appointment_status",
  authenticate,
  role_allowed("DOCTOR"),
  appointment_controller.appointment_status,
);
router.post("/rate/:id", authenticate, appointment_controller.rate);

export default router;
