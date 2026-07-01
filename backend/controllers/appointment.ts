import e, { Request, Response } from "express";
import prisma from "../src/db.ts";
import app from "../app.ts";
import { gather, where } from "@tensorflow/tfjs-node";
import { stat } from "fs";

export const book_appointment = async (req: Request, res: Response) => {
  const doctor_id = req.params.doctor_id as string;
  const { time, patient_brief, reason } = req.body;
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctor_id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
        hospital: {
          select: {
            name: true,
            address: true,
            state: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "doctor doesnt exist",
      });
    }
    const patient = await prisma.patient.findUnique({
      where: { user_id: req.user!.id },
    });
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "patient not found",
      });
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    if (doctor.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "doctor is not available",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: doctor_id,
        scheduledAt: time ? new Date(time) : null,
        patient_brief: patient_brief,
        reason: reason,
      },
      include: {
        doctor: {
          select: {
            first_name: true,
            last_name: true,
            specialization: true,
          },
        },
        patient: {
          select: { first_name: true, last_name: true },
        },
      },
    });

    await prisma.notification.create({
      data: {
        user_id: doctor_id,
        title: "new appointment request",
        message: `${appointment.patient.first_name} ${appointment.patient.last_name} has requested an appointment.`,
      },
    });

    return res.status(201).json({
      success: true,
      message: "appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

export const get_patient_appointment = async (req: Request, res: Response) => {
  const patient_id: string = req.user!.id;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patient_id },
    });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "patient doesnt exist",
      });
    }
    const appointment = await prisma.appointment.findMany({
      where: { patient_id: patient_id },
      include: {
        doctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            specialization: true,
            location: true,
            rating: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

//cancel appointment
export const cancel_appointment = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: id },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "appointment doest exists",
      });
    }
    await prisma.appointment.delete({ where: { id: id } });
    return res.status(200).json({
      success: true,
      message: "successfully deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong ${error}`,
    });
  }
};

//get a single appoinyment
export const get_appointment = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: id },
      include: {
        doctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            specialization: true,
            location: true,
            rating: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            state: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "appointment doesnt exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "succesful",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong ${error}`,
    });
  }
};

//approve or reject appointment
export const appointment_status = async (req: Request, res: Response) => {
  const { id, status } = req.body;
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: id },
    });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "appointment doesnt exist",
      });
    }

    if (!status) {
      return res.status(401).json({
        success: false,
        message: `status not provided`,
      });
    }
    await prisma.appointment.update({
      where: { id: id },
      data: {
        status: status,
      },
    });

    return res.status(200).json({
      success: true,
      message: "status update successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong ${error}`,
    });
  }
};

//doctor get appointment
export const get_doctor_appointment = async (req: Request, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { user_id: req.user!.id },
    });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "doctor not found" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctor_id: doctor.id },
      include: {
        patient: { select: { first_name: true, last_name: true } },
        hospital: { select: { name: true, address: true, state: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};

export const rate = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { rating } = req.body; // rating from 1-5

  try {
    const doctor = await prisma.doctor.findUnique({ where: { id } });

    if (doctor) {
      await prisma.doctor.update({
        where: { id },
        data: {
          totalRatings: { increment: 1 },
          rating:
            (doctor.rating * doctor.totalRatings + rating) /
            (doctor.totalRatings + 1),
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "rated successfully" });
    }

    const hospital = await prisma.hospital.findUnique({ where: { id } });

    if (hospital) {
      await prisma.hospital.update({
        where: { id },
        data: {
          total_ratings: { increment: 1 },
          rating:
            (hospital.rating * hospital.total_ratings + rating) /
            (hospital.total_ratings + 1),
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "rated successfully" });
    }

    return res.status(404).json({ success: false, message: "not found" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};
