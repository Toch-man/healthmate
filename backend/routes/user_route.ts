// routes/user.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth_middleware.ts";
import prisma from "../src/db.ts";

const router = Router();

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        role: true,
        patient: true,
        doctor: true,
        hospital: true,
        admin: true,
      },
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
});

export default router;
