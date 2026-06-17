import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";
import app from "../app.ts";
import prisma from "../src/db.ts";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Admin Routes", () => {
  let adminCookie: string;
  let patientCookie: string;
  let pendingDoctorId: string;
  let pendingDoctorUserId: string;
  let approvedDoctorId: string;

  const adminEmail = `admin_test_user_${Date.now()}@gmail.com`;
  const patientEmail = `admin_test_patient_${Date.now()}@gmail.com`;
  const pendingDoctorEmail = `admin_test_pending_doc_${Date.now()}@gmail.com`;
  const approvedDoctorEmail = `admin_test_approved_doc_${Date.now()}@gmail.com`;

  beforeAll(async () => {
    // Clean up

    await prisma.doctor.deleteMany({
      where: {
        user: { email: { in: [pendingDoctorEmail, approvedDoctorEmail] } },
      },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: patientEmail } },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            adminEmail,
            patientEmail,
            pendingDoctorEmail,
            approvedDoctorEmail,
          ],
        },
      },
    });

    // Create admin
    const adminHash = await bcrypt.hash("testpass123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminHash,
        role: "ADMIN",
        admin: {
          create: {
            first_name: "Super",
            last_name: "Admin",
          },
        },
      },
    });

    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    const adminAccessToken = jwt.sign(
      { user_id: adminUser!.id, role: "ADMIN" },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15min" },
    );
    adminCookie = `access_token=${adminAccessToken}`;

    // Create patient
    const patientHash = await bcrypt.hash("testpass123", 10);
    const patientUser = await prisma.user.create({
      data: {
        email: patientEmail,
        password: patientHash,
        role: "PATIENT",
        patient: {
          create: {
            first_name: "AdminTestPatient",
            last_name: "Test",
            date_of_birth: new Date("2000-01-01"),
            gender: "MALE",
            phone: "09059395200",
          },
        },
      },
    });
    const patientAccessToken = jwt.sign(
      { user_id: patientUser.id, role: "PATIENT" },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15min" },
    );
    patientCookie = `access_token=${patientAccessToken}`;

    // Create a pending doctor
    const pendingDocHash = await bcrypt.hash("testpass123", 10);
    const pendingDocUser = await prisma.user.create({
      data: {
        email: pendingDoctorEmail,
        password: pendingDocHash,
        role: "DOCTOR",
        doctor: {
          create: {
            first_name: "Pending",
            last_name: "Doctor",
            phone: "09059395201",
            gender: "MALE",
            specialization: "General",
            yearsExperience: 3,
            location: "Lagos",
            licenseNumber: "PENDDOC001",
            status: "PENDING",
          },
        },
      },
    });
    pendingDoctorUserId = pendingDocUser.id;
    const pendingDoc = await prisma.doctor.findUnique({
      where: { user_id: pendingDoctorUserId },
    });
    pendingDoctorId = pendingDoc!.id;

    // Create an approved doctor
    const approvedDocHash = await bcrypt.hash("testpass123", 10);
    const approvedDocUser = await prisma.user.create({
      data: {
        email: approvedDoctorEmail,
        password: approvedDocHash,
        role: "DOCTOR",
        doctor: {
          create: {
            first_name: "Approved",
            last_name: "Doctor",
            phone: "09059395202",
            gender: "FEMALE",
            specialization: "Cardiology",
            yearsExperience: 7,
            location: "Abuja",
            licenseNumber: "APPRDOC002",
            status: "APPROVED",
          },
        },
      },
    });
    const approvedDoc = await prisma.doctor.findUnique({
      where: { user_id: approvedDocUser.id },
    });
    approvedDoctorId = approvedDoc!.id;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: {} });
    await prisma.doctor.deleteMany({
      where: {
        user: { email: { in: [pendingDoctorEmail, approvedDoctorEmail] } },
      },
    });
    await prisma.patient.deleteMany({
      where: { user: { email: patientEmail } },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            adminEmail,
            patientEmail,
            pendingDoctorEmail,
            approvedDoctorEmail,
          ],
        },
      },
    });
    await prisma.$disconnect();
  });

  // ==================== GET PENDING DOCTORS ====================
  describe("GET /api/admin/pending_doctors", () => {
    test("should list pending doctors", async () => {
      const res = await request(app)
        .get("/api/admin/pending_doctors")
        .set("Cookie", adminCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((d: any) => d.id === pendingDoctorId)).toBe(
        true,
      );
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get("/api/admin/pending_doctors");

      expect(res.statusCode).toBe(401);
    });

    test("should fail for non-admin role", async () => {
      const res = await request(app)
        .get("/api/admin/pending_doctors")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(403);
    });
  });

  // ==================== UPDATE DOCTOR STATUS ====================
  describe("PUT /api/admin/doctor_status/:id", () => {
    test("should approve a pending doctor", async () => {
      const res = await request(app)
        .put(`/api/admin/doctor_status/${pendingDoctorId}`)
        .set("Cookie", adminCookie)
        .send({ status: "APPROVED" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should reject with invalid status", async () => {
      const res = await request(app)
        .put(`/api/admin/doctor_status/${pendingDoctorId}`)
        .set("Cookie", adminCookie)
        .send({ status: "INVALID_STATUS" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should fail for non-existent doctor", async () => {
      const res = await request(app)
        .put("/api/admin/doctor_status/nonexistent_id")
        .set("Cookie", adminCookie)
        .send({ status: "APPROVED" });

      expect(res.statusCode).toBe(404);
    });

    test("should suspend an approved doctor", async () => {
      const res = await request(app)
        .put(`/api/admin/doctor_status/${approvedDoctorId}`)
        .set("Cookie", adminCookie)
        .send({ status: "SUSPENDED" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== GET PENDING HOSPITALS ====================
  describe("GET /api/admin/pending_hospitals", () => {
    test("should list pending hospitals", async () => {
      const res = await request(app)
        .get("/api/admin/pending_hospitals")
        .set("Cookie", adminCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get("/api/admin/pending_hospitals");

      expect(res.statusCode).toBe(401);
    });
  });

  // ==================== GET ALL USERS ====================
  describe("GET /api/admin/users", () => {
    test("should list all users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", adminCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3); // admin + patient + 2 doctors
    });

    test("should fail without authentication", async () => {
      const res = await request(app).get("/api/admin/users");

      expect(res.statusCode).toBe(401);
    });

    test("should fail for non-admin role", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", patientCookie);

      expect(res.statusCode).toBe(403);
    });
  });
});
