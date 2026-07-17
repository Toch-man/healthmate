import express from "express";
import { authenticate, role_allowed } from "../middleware/auth_middleware.ts";
import * as admin_controller from "../controllers/admin_controller.ts";

const router = express.Router();

router.get(
  "/pending_doctors",
  authenticate,
  role_allowed("ADMIN"),
  admin_controller.get_pending_doctors,
);
router.get(
  "/pending_hospitals",
  authenticate,
  role_allowed("ADMIN"),
  admin_controller.get_pending_hospitals,
);
router.patch(
  "/doctor_status/:id",
  authenticate,
  role_allowed("ADMIN"),
  admin_controller.update_doctor_status,
);
router.patch(
  "/hospital_status/:id",
  authenticate,
  role_allowed("ADMIN"),
  admin_controller.update_hospital_status,
);
router.get(
  "/users",
  authenticate,
  role_allowed("ADMIN"),
  admin_controller.get_all_users,
);

export default router;
