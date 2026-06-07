// routes/diagnosis.routes.ts
import { authenticate, role_allowed } from "../middleware/auth_middleware.ts";
import { chat } from "../controllers/diagnosis_controller.ts";
import express from "express";

const router = express.Router();
router.post("/diagnosis/chat", authenticate, role_allowed("PATIENT"), chat);
