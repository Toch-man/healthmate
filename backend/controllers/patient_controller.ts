import prisma from "../src/db.ts";
import { Request, Response } from "express";
import { find_patient } from "../services/patient_service.ts";

export const patient_profile = async (req: Request, res: Response) => {
  try {
    const patient = await find_patient(req.user!.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "patient not found" });
    }
    return res.status(200).json({ success: true, data: patient });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};

// ── UPDATE PROFILE ───────────────────────────────────────
export const update_patient_profile = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      blood_group,
      allergies,
      medications,
      conditions,
      language,
    } = req.body;

    const patient = await find_patient(req.user!.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "patient not found" });
    }

    const updated = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(phone && { phone }),
        ...(blood_group && { blood_group }),
        ...(allergies && { allergies }),
        ...(medications && { medications }),
        ...(conditions && { conditions }),
        ...(language && { language }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "profile updated successfully",
      data: updated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};

// ── GET HEALTH RECORDS ───────────────────────────────────
export const get_health_records = async (req: Request, res: Response) => {
  try {
    const patient = await find_patient(req.user!.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "patient not found" });
    }

    const records = await prisma.healthRecord.findMany({
      where: { patient_id: patient.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        symptoms: true,
        diagnosis: true,
        severity: true,
        explanation: true,
        immediateAdvice: true,
        warningSignss: true,
        aiSource: true,
        detected_language: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};

// ── GET SINGLE HEALTH RECORD ─────────────────────────────
export const get_health_record = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const record = await prisma.healthRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "record not found" });
    }

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};

// ── GET AVAILABLE DOCTORS ────────────────────────────────
export const get_available_doctors = async (req: Request, res: Response) => {
  try {
    const { specialization, location } = req.query;

    const doctors = await prisma.doctor.findMany({
      where: {
        status: "APPROVED",
        available: true,
        ...(specialization && {
          specialization: {
            contains: specialization as string,
            mode: "insensitive",
          },
        }),
        ...(location && {
          location: {
            contains: location as string,
            mode: "insensitive",
          },
        }),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        specialization: true,
        location: true,
        rating: true,
        totalRatings: true,
        yearsExperience: true,
        bio: true,
        hospital: {
          select: { name: true, address: true },
        },
      },
      orderBy: { rating: "desc" },
    });

    return res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong", error });
  }
};
