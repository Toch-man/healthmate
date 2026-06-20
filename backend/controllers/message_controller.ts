import { Request, Response } from "express";
import prisma from "../src/db.ts";

// get chat history for an appointment
export const get_messages = async (req: Request, res: Response) => {
  try {
    const appointment_id = req.params.appointment_id as string;

    // verify user is part of this appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointment_id },
      include: {
        patient: { select: { user_id: true } },
        doctor: { select: { user_id: true } },
      },
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "appointment not found" });
    }

    const is_patient = appointment.patient.user_id === req.user!.id;
    const is_doctor = appointment.doctor.user_id === req.user!.id;

    if (!is_patient && !is_doctor) {
      return res.status(403).json({ success: false, message: "unauthorized" });
    }

    const messages = await prisma.message.findMany({
      where: { appointment_id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};
