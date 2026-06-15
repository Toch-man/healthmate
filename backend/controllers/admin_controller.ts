import { Request, Response } from "express";
import prisma from "../src/db.ts";

//  GET ALL PENDING DOCTORS
export const get_pending_doctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

//  GET ALL PENDING HOSPITALS
export const get_pending_hospitals = async (req: Request, res: Response) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: hospitals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

//  APPROVE OR REJECT DOCTOR
export const update_doctor_status = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // APPROVED, REJECTED, SUSPENDED

    const allowed_statuses = ["APPROVED", "REJECTED", "SUSPENDED"];
    if (!allowed_statuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "invalid status",
      });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    await prisma.doctor.update({
      where: { id },
      data: { status },
    });

    // notify doctor
    await prisma.notification.create({
      data: {
        user_id: doctor.user_id,
        title: "Account Status Update",
        message:
          status === "APPROVED"
            ? "Your account has been approved. You can now receive appointments."
            : status === "REJECTED"
              ? "Your account application has been rejected."
              : "Your account has been suspended. Please contact support.",
      },
    });

    return res.status(200).json({
      success: true,
      message: `doctor ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

//  APPROVE OR REJECT HOSPITAL
export const update_hospital_status = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // APPROVED, REJECTED, SUSPENDED

    const allowed_statuses = ["APPROVED", "REJECTED", "SUSPENDED"];
    if (!allowed_statuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "invalid status",
      });
    }

    const hospital = await prisma.hospital.findUnique({ where: { id } });
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "hospital not found",
      });
    }

    await prisma.hospital.update({
      where: { id },
      data: { status },
    });

    // notify hospital
    await prisma.notification.create({
      data: {
        user_id: hospital.user_id,
        title: "Account Status Update",
        message:
          status === "APPROVED"
            ? "Your hospital has been approved and is now listed on HealthMate."
            : status === "REJECTED"
              ? "Your hospital application has been rejected."
              : "Your hospital account has been suspended. Please contact support.",
      },
    });

    return res.status(200).json({
      success: true,
      message: `hospital ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

// GET ALL USERS
export const get_all_users = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        patient: { select: { first_name: true, last_name: true } },
        doctor: { select: { first_name: true, last_name: true, status: true } },
        hospital: { select: { name: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};
