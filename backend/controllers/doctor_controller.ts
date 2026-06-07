// controllers/doctor_controller.ts
import { Request, Response } from "express";
import prisma from "../src/db";
import { find_patient } from "../services/patient_service";

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
        ...(available !== undefined && { available }), // boolean needs different check
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
        // optional filters
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
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

export const doctor_patient_profile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const patient = await find_patient(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};
