import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";
import app from "../app.ts";
import prisma from "../src/db.ts";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Appointment Routes", () => {
  let patientCookie: string;
  let patientUserId: string;
  let patientId: string;
  let doctorCookie: string;
  let doctorId: string;
  let doctorUserId: string;
  let appointmentId: string;

  const patientEmail = `appt_test_patient_${Date.now()}@gmail.com`;
  const doctorEmail = `appt_test_doctor_${Date.now()}@gmail.com`;

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
            first_name: "ApptPatient",
            last_name: "Test",
            date_of_birth: new Date("2000-01-01"),
            gender: "FEMALE",
            phone: "09059395190",
          },
        },
      },
      include: { patient: true },
    });
    patientUserId = patientUser.id;
    patientId = patientUser.patient!.id;

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
            first_name: "ApptDoctor",
            last_name: "Test",
            phone: "09059395191",
            gender: "MALE",
            specialization: "Cardiology",
            yearsExperience: 10,
            location: "Abuja",
            licenseNumber: "APPTDOC001",
            status: "APPROVED",
            available: true,
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

  // ==================== BOOK APPOINTMENT ====================
  describe("POST /api/appointment/book_appointment/:doctor_id", () => {
    test("should book an appointment successfully", async () => {
      const res = await request(app)
        .post(`/api/appointment/book_appointment/${doctorId}`)
        .set("Cookie", patientCookie)
        .send({
          time: new Date("2026-07-01T10:00:00Z").toISOString(),
          patient_brief: "Feeling chest pain",
          reason: "Cardiology checkup",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("doctor_id", doctorId);
      expect(res.body.data.status).toBe("PENDING");
      appointmentId = res.body.data.id;
    });

    test("should fail without authentication", async () => {
      const res = await request(app).post(
        `/api/appointment/book_appointment/${doctorId}`,
      );

      expect(res.statusCode).toBe(401);
    });

    test("should fail for non-patient role (doctor)", async () => {
      const res = await request(app)
        .post(`/api/appointment/book_appointment/${doctorId}`)
        .set("Cookie", doctorCookie)
        .send({ reason: "test" });

      expect(res.statusCode).toBe(403);
    });

    test("should fail with non-existent doctor id", async () => {
      const res = await request(app)
        .post("/api/appointment/book_appointment/nonexistent_doctor")
        .set("Cookie", patientCookie)
        .send({ reason: "test" });

      expect(res.statusCode).toBe(400);
    });
  });

  // ==================== GET PATIENT APPOINTMENTS ====================
  describe("GET /api/appointment/patient_appointments", () => {
    test("should get patient appointments", async () => {
      const res = await request(app)
        .get("/api/appointment/patient_appointments")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get(
        "/api/appointment/patient_appointments",
      );

      expect(res.statusCode).toBe(401);
    });

    test("should fail for non-patient role", async () => {
      const res = await request(app)
        .get("/api/appointment/patient_appointments")
        .set("Cookie", doctorCookie);

      expect(res.statusCode).toBe(403);
    });
  });

  // ==================== GET APPOINTMENT BY ID ====================
  describe("GET /api/appointment/appointment/:id", () => {
    test("should get appointment by id", async () => {
      const res = await request(app)
        .get(`/api/appointment/appointment/${appointmentId}`)
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.appointment).toHaveProperty("id", appointmentId);
    });

    test("should return 404 for non-existent appointment", async () => {
      const res = await request(app)
        .get("/api/appointment/appointment/nonexistent_id")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get(
        `/api/appointment/appointment/${appointmentId}`,
      );

      expect(res.statusCode).toBe(401);
    });
  });

  // ==================== UPDATE APPOINTMENT STATUS ====================
  describe("POST /api/appointment/appointment_status", () => {
    test("should approve appointment as doctor", async () => {
      const res = await request(app)
        .post("/api/appointment/appointment_status")
        .set("Cookie", doctorCookie)
        .send({ id: appointmentId, status: "1" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should fail for non-doctor role", async () => {
      const res = await request(app)
        .post("/api/appointment/appointment_status")
        .set("Cookie", patientCookie)
        .send({ id: appointmentId, status: "1" });

      expect(res.statusCode).toBe(403);
    });

    test("should fail with non-existent appointment", async () => {
      const res = await request(app)
        .post("/api/appointment/appointment_status")
        .set("Cookie", doctorCookie)
        .send({ id: "nonexistent_id", status: "1" });

      expect(res.statusCode).toBe(500);
    });
  });

  // ==================== CANCEL APPOINTMENT ====================
  describe("DELETE /api/appointment/cancel_appointment/:id", () => {
    test("should cancel appointment successfully", async () => {
      // Create another appointment to cancel
      const bookRes = await request(app)
        .post(`/api/appointment/book_appointment/${doctorId}`)
        .set("Cookie", patientCookie)
        .send({ reason: "To cancel" });

      const cancelId = bookRes.body.data.id;

      const res = await request(app)
        .delete(`/api/appointment/cancel_appointment/${cancelId}`)
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should fail with non-existent appointment", async () => {
      const res = await request(app)
        .delete("/api/appointment/cancel_appointment/nonexistent_id")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(404);
    });

    test("should fail without authentication", async () => {
      const res = await request(app).delete(
        `/api/appointment/cancel_appointment/${appointmentId}`,
      );

      expect(res.statusCode).toBe(401);
    });
  });

  // ==================== DOCTOR APPOINTMENTS ====================
  describe("GET /api/appointment/doctor_appointments/:doctor_id", () => {
    test("should get doctor appointments", async () => {
      const res = await request(app)
        .get(`/api/appointment/doctor_appointments/${doctorId}`)
        .set("Cookie", doctorCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.doctor_appointment).toBeDefined();
      expect(Array.isArray(res.body.doctor_appointment)).toBe(true);
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get(
        `/api/appointment/doctor_appointments/${doctorId}`,
      );

      expect(res.statusCode).toBe(401);
    });

    test("should fail for non-doctor role", async () => {
      const res = await request(app)
        .get(`/api/appointment/doctor_appointments/${doctorId}`)
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(403);
    });
  });

  // ==================== RATE DOCTOR ====================
  describe("POST /api/appointment/rate/:id", () => {
    test("should rate a doctor successfully", async () => {
      const res = await request(app)
        .post(`/api/appointment/rate/${doctorId}`)
        .set("Cookie", patientCookie)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should fail with non-existent id", async () => {
      const res = await request(app)
        .post("/api/appointment/rate/nonexistent_id")
        .set("Cookie", patientCookie)
        .send({ rating: 3 });

      expect(res.statusCode).toBe(404);
    });
  });
});
