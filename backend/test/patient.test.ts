import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";
import app from "../app.ts";
import prisma from "../src/db.ts";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Patient Routes", () => {
  let patientCookie: string;
  let doctorCookie: string;
  let patientUserId: string;

  const patientEmail = `patient_test_user_${Date.now()}@gmail.com`;
  const doctorEmail = `patient_test_doctor_${Date.now()}@gmail.com`;

  beforeAll(async () => {
    // Clean up
    await prisma.patient.deleteMany({
      where: { user: { email: patientEmail } },
    });
    await prisma.doctor.deleteMany({
      where: { user: { email: doctorEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [patientEmail, doctorEmail] } },
    });

    // Create patient
    const patientHash = await bcrypt.hash("testpass123", 10);
    const patientUser = await prisma.user.create({
      data: {
        email: patientEmail,
        password: patientHash,
        role: "PATIENT",
        patient: {
          create: {
            first_name: "Patient",
            last_name: "Test",
            date_of_birth: new Date("2000-01-01"),
            gender: "MALE",
            phone: "09059395180",
          },
        },
      },
    });
    patientUserId = patientUser.id;

    const patientAccessToken = jwt.sign(
      { user_id: patientUser.id, role: "PATIENT" },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15min" },
    );
    patientCookie = `access_token=${patientAccessToken}`;

    // Create doctor
    const doctorHash = await bcrypt.hash("testpass123", 10);
    const doctorUser = await prisma.user.create({
      data: {
        email: doctorEmail,
        password: doctorHash,
        role: "DOCTOR",
        doctor: {
          create: {
            first_name: "Doctor",
            last_name: "Test",
            phone: "09059395181",
            gender: "MALE",
            specialization: "General",
            yearsExperience: 5,
            location: "Lagos",
            licenseNumber: "DOC54321",
            status: "APPROVED",
          },
        },
      },
    });

    const doctorAccessToken = jwt.sign(
      { user_id: doctorUser.id, role: "DOCTOR" },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15min" },
    );
    doctorCookie = `access_token=${doctorAccessToken}`;
  });

  afterAll(async () => {
    await prisma.patient.deleteMany({
      where: { user: { email: patientEmail } },
    });
    await prisma.doctor.deleteMany({
      where: { user: { email: doctorEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [patientEmail, doctorEmail] } },
    });
    await prisma.$disconnect();
  });

  // ==================== GET PATIENT PROFILE ====================
  describe("GET /api/patient/patient-profile", () => {
    test("should get patient profile when authenticated as patient", async () => {
      const res = await request(app)
        .get("/api/patient/patient-profile")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("first_name", "Patient");
      expect(res.body.data).toHaveProperty("last_name", "Test");
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get("/api/patient/patient-profile");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should fail for non-patient role (doctor)", async () => {
      const res = await request(app)
        .get("/api/patient/patient-profile")
        .set("Cookie", doctorCookie);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
