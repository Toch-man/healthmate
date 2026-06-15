import prisma from "../src/db.ts";
import { Request, Response } from "express";
import { find_patient } from "../services/patient_service.ts";

export const patient_profile = async (req: Request, res: Response) => {
  try {
    const patient = await find_patient(req.user!.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "user not found ",
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
