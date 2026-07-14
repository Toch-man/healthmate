import express from "express";
import passport from "../config/google_passport.ts";
import * as auth_controller from "../controllers/auth_controller.ts";
import { authenticate } from "../middleware/auth_middleware.ts";
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
router.get("/me", authenticate, auth_controller.me);
router.post("/patient_signup", auth_controller.patient_signup);
router.post("/doctor_signup", auth_controller.doctor_signup);
router.post("/login", auth_controller.log_in);
router.post("/logout", auth_controller.logout);
router.post("/exchange_code", auth_controller.exchange_code);
router.post("/refresh_token", auth_controller.refresh_token);
router.patch("/role", auth_controller.set_role);
router.post("/forgot_password", auth_controller.forgot_password);
router.post("/reset_password", auth_controller.reset_token);
router.patch("/set_role", authenticate, auth_controller.set_role);
export default router;
