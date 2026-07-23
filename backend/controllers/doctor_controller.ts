// controllers/doctor_controller.ts
import { Request, Response } from "express";
import prisma from "../src/db.ts";
import { find_patient } from "../services/patient_service.ts";

export const get_doctor_profile = async (req: Request, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { user_id: req.user!.id },
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
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("GET DOCTOR PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

export const update_doctor_profile = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      bio,
      location,
      available,
      specialization,
      credentials,
    } = req.body;

    const doctor = await prisma.doctor.update({
      where: { user_id: req.user!.id },
      data: {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(location && { location }),
        ...(available !== undefined && { available }),
        ...(specialization && { specialization }),
        ...(credentials && { credentials }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("UPDATE DOCTOR PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

export const get_doctor_by_id = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
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
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("GET DOCTOR BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

export const get_all_doctors = async (req: Request, res: Response) => {
  try {
    const { specialization, location } = req.query as {
      specialization?: string;
      location?: string;
    };

    const doctors = await prisma.doctor.findMany({
      where: {
        status: "APPROVED",
        available: true,
        ...(specialization && { specialization }),
        ...(location && { location }),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        specialization: true,
        location: true,
        rating: true,
        yearsExperience: true,
        bio: true,
        hospital: {
          select: {
            name: true,
            state: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("GET ALL DOCTORS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

// IMPORTANT: this expects a User.id in the URL param, NOT a Patient.id,
// since find_patient() looks up by { where: { user_id } }.
// Your Appointment model stores patient_id as a Patient.id — if your
// frontend links here using appointment.patient_id directly, this will
// 404 even though the patient genuinely exists. Make sure whatever
// calls this route passes the patient's User.id (e.g. via
// appointment.patient.user_id, if that relation is included when you
// fetch the appointment on the frontend/backend).
export const doctor_patient_profile = async (req: Request, res: Response) => {
  try {
    const user_id = req.params.id as string;
    const patient = await find_patient(user_id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }

    // patient.id here is the correct Patient.id, safe to use below
    // regardless of what was passed into the URL
    const health_records = await prisma.healthRecord.findMany({
      where: { patient_id: patient.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        symptoms: true,
        diagnosis: true,
        severity: true,
        explanation: true,
        immediateAdvice: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { ...patient, health_records },
    });
  } catch (error) {
    console.error("DOCTOR PATIENT PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};
