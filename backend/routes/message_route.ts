import express from "express";
import { authenticate } from "../middleware/auth_middleware.ts";
import { get_messages } from "../controllers/message_controller.ts";

const router = express.Router();

router.get("/:appointment_id", authenticate, get_messages);

export default router;
