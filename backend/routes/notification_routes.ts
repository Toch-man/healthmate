import express from "express";
import { authenticate } from "../middleware/auth_middleware.ts";
import * as notification_controller from "../controllers/notification_controller.ts";

const router = express.Router();

router.get("/", authenticate, notification_controller.get_notifications);
router.patch("/:id/read", authenticate, notification_controller.mark_read);
router.patch("/read-all", authenticate, notification_controller.mark_all_read);

export default router;
