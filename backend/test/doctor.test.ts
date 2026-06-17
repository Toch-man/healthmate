import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";
import app from "../app.ts";
import prisma from "../src/db.ts";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Doctor Routes", () => {
  let patientCookie: string;
  let doctorCookie: string;
  let doctorId: string;
  let adminCookie: string;
  let patientUserId: string;
  let doctorUserId: string;

  const patientEmail = `doctor_test_patient_${Date.now()}@gmail.com`;
  const doctorEmail = `doctor_test_doctor_${Date.now()}@gmail.com`;
  const adminEmail = `doctor_test_admin_${Date.now()}@gmail.com`;

  beforeAll(async () => {
    // Clean up any existing data
    await prisma.appointment.deleteMany({ where: {} });
    await prisma.patient.deleteMany({
      where: { user: { email: patientEmail } },
    });
    await prisma.doctor.deleteMany({ where: { user: { email: doctorEmail } } });
    await prisma.user.deleteMany({
      where: { email: { in: [patientEmail, doctorEmail, adminEmail] } },
    });

    // Create a patient user
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
            phone: "09059395170",
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

    // Create a doctor user
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
            phone: "09059395171",
            gender: "MALE",
            specialization: "Cardiology",
            yearsExperience: 8,
            location: "Lagos",
            licenseNumber: "DOC12345",
            status: "APPROVED",
            available: true,
            bio: "Experienced cardiologist",
          },
        },
      },
    });
    doctorUserId = doctorUser.id;
    const doctorRecord = await prisma.doctor.findUnique({
      where: { user_id: doctorUser.id },
    });
    doctorId = doctorRecord!.id;

    const doctorAccessToken = jwt.sign(
      { user_id: doctorUser.id, role: "DOCTOR" },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15min" },
    );
    doctorCookie = `access_token=${doctorAccessToken}`;

    // Create an admin user
    const adminHash = await bcrypt.hash("testpass123", 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminHash,
        role: "ADMIN",
        admin: {
          create: {
            first_name: "Admin",
            last_name: "Test",
          },
        },
      },
    });
    const adminAccessToken = jwt.sign(
      { user_id: adminUser.id, role: "ADMIN" },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15min" },
    );
    adminCookie = `access_token=${adminAccessToken}`;
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: {} });
    await prisma.patient.deleteMany({
      where: { user: { email: patientEmail } },
    });
    await prisma.doctor.deleteMany({ where: { user: { email: doctorEmail } } });
    await prisma.user.deleteMany({
      where: { email: { in: [patientEmail, doctorEmail, adminEmail] } },
    });
    await prisma.$disconnect();
  });

  // ==================== GET DOCTOR PROFILE ====================
  describe("GET /api/doctor/doctor_profile", () => {
    test("should get doctor profile when authenticated as doctor", async () => {
      const res = await request(app)
        .get("/api/doctor/doctor_profile")
        .set("Cookie", doctorCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("first_name", "Doctor");
      expect(res.body.data).toHaveProperty("specialization", "Cardiology");
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get("/api/doctor/doctor_profile");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should fail when authenticated as patient (wrong role)", async () => {
      const res = await request(app)
        .get("/api/doctor/doctor_profile")
        .set("Cookie", patientCookie);

      // no role_allowed check on this route, but user has no doctor profile
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== GET ALL DOCTORS ====================
  describe("GET /api/doctor/doctors", () => {
    test("should list all approved doctors with filters", async () => {
      const res = await request(app)
        .get("/api/doctor/doctors")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test("should filter doctors by specialization", async () => {
      const res = await request(app)
        .get("/api/doctor/doctors?specialization=Cardiology")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(200);
      expect(
        res.body.data.every((d: any) => d.specialization === "Cardiology"),
      ).toBe(true);
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get("/api/doctor/doctors");

      expect(res.statusCode).toBe(401);
    });

    test("should return empty array for non-matching filters", async () => {
      const res = await request(app)
        .get("/api/doctor/doctors?specialization=UnknownSpecialty999")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  // ==================== GET DOCTOR BY ID ====================
  describe("GET /api/doctor/doctor/:id", () => {
    test("should get doctor by id successfully", async () => {
      const res = await request(app)
        .get(`/api/doctor/doctor/${doctorId}`)
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id", doctorId);
    });

    test("should return 404 for non-existent doctor id", async () => {
      const res = await request(app)
        .get("/api/doctor/doctor/nonexistent_id_12345")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get(`/api/doctor/doctor/${doctorId}`);

      expect(res.statusCode).toBe(401);
    });
  });

  // ==================== UPDATE DOCTOR PROFILE ====================
  describe("POST /api/doctor/update_doctor_profile", () => {
    test("should update doctor profile successfully", async () => {
      const res = await request(app)
        .post("/api/doctor/update_doctor_profile")
        .set("Cookie", doctorCookie)
        .send({
          first_name: "Updated",
          bio: "Updated bio",
          location: "Abuja",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("first_name", "Updated");
      expect(res.body.data).toHaveProperty("bio", "Updated bio");
    });

    test("should fail when patient tries to update doctor profile", async () => {
      const res = await request(app)
        .post("/api/doctor/update_doctor_profile")
        .set("Cookie", patientCookie)
        .send({ first_name: "Hacker" });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/doctor/update_doctor_profile")
        .send({ first_name: "NoAuth" });

      expect(res.statusCode).toBe(401);
    });
  });

  // ==================== DOCTOR PATIENT PROFILE ====================
  describe("GET /api/doctor/doctor_patient", () => {
    test("should fail when patient id param is missing", async () => {
      // The route expects a param like /doctor_patient/:id but defined as /doctor_patient
      // So it will likely get undefined id
      const res = await request(app)
        .get("/api/doctor/doctor_patient")
        .set("Cookie", doctorCookie);

      expect(res.statusCode).toBe(404);
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get("/api/doctor/doctor_patient");

      expect(res.statusCode).toBe(401);
    });

    test("should fail for non-doctor role", async () => {
      const res = await request(app)
        .get("/api/doctor/doctor_patient")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
