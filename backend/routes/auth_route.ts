import express from "express";
import passport from "../config/google_passport.ts";
import * as auth_controller from "../controllers/auth_controller.ts";

const router = express.Router();

// google oauth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  auth_controller.google_callback,
);

// auth routes
router.post("/patient_signup", auth_controller.patient_signup);
router.post("/doctor_signup", auth_controller.doctor_signup);
router.post("/login", auth_controller.log_in);
router.post("/exchange_code", auth_controller.exchange_code);
router.post("/refresh_token", auth_controller.refresh_token);
router.post("/set_role", auth_controller.set_role);
router.post("/forgot_password", auth_controller.forgot_password);
router.post("/reset_password", auth_controller.reset_token);

export default router;
