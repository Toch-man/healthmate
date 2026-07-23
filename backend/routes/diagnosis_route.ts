import { authenticate, role_allowed } from "../middleware/auth_middleware.ts";
import * as diagnosis from "../controllers/diagnosis_controller.ts";
import express from "express";

const router = express.Router();

router.post(
  "/diagnosis/chat",
  authenticate,
  role_allowed("PATIENT"),
  diagnosis.chat,
);

router.get(
  "/diagnosis/history",
  authenticate,
  role_allowed("PATIENT"),
  diagnosis.get_history,
);

router.post(
  "/diagnosis/new",
  authenticate,
  role_allowed("PATIENT"),
  diagnosis.start_new_conversation,
);

export default router;
