import { Request, Response } from "express";
import prisma from "../src/db.ts";

export const get_notifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};

export const mark_read = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return res.status(200).json({ success: true, message: "marked as read" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};

export const mark_all_read = async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user!.id, read: false },
      data: { read: true },
    });
    return res
      .status(200)
      .json({ success: true, message: "all marked as read" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};
