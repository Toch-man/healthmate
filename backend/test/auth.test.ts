import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";
import app from "../app.ts";
import prisma from "../src/db.ts";
import request from "supertest";

describe("Auth Routes", () => {
  const test_user = {
    email: "testuser_auth@gmail.com",
    password: "1234abcd",
    first_name: "Hello",
    last_name: "World",
    date_of_birth: "2000-01-01",
    gender: "MALE",
    phone: "09059395167",
  };

  const test_doctor = {
    email: "testdoctor_auth@gmail.com",
    password: "1234abcd",
    first_name: "Doctor",
    last_name: "Test",
    phone: "09059395168",
    gender: "MALE",
    specialization: "Cardiology",
    yearsExperience: "5",
    location: "Lagos",
    licenseNumber: "LIC12345",
  };

  beforeAll(async () => {
    // clean up test users before tests
    await prisma.patient.deleteMany({
      where: { user: { email: test_user.email } },
    });
    await prisma.user.deleteMany({
      where: { email: test_user.email },
    });
    await prisma.doctor.deleteMany({
      where: { user: { email: test_doctor.email } },
    });
    await prisma.user.deleteMany({
      where: { email: test_doctor.email },
    });
  });

  afterAll(async () => {
    // clean up after all tests
    await prisma.patient.deleteMany({
      where: { user: { email: test_user.email } },
    });
    await prisma.user.deleteMany({
      where: { email: test_user.email },
    });
    await prisma.doctor.deleteMany({
      where: { user: { email: test_doctor.email } },
    });
    await prisma.user.deleteMany({
      where: { email: test_doctor.email },
    });
    await prisma.$disconnect();
  });

  // PATIENT SIGNUP
  describe("POST /api/auth/patient_signup", () => {
    test("should register a new patient successfully", async () => {
      const res = await request(app)
        .post("/api/auth/patient_signup")
        .send(test_user);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("patient");
      expect(res.body.user.email).toBe(test_user.email);
      expect(res.body.user.role).toBe("PATIENT");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("should reject duplicate email registration", async () => {
      const res = await request(app)
        .post("/api/auth/patient_signup")
        .send(test_user);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("email already exist");
    });

    test("should reject registration with missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/patient_signup")
        .send({ email: "incomplete@test.com" });

      expect(res.statusCode).toBe(500);
    });
  });

  // ==================== DOCTOR SIGNUP ====================
  describe("POST /api/auth/doctor_signup", () => {
    test("should register a new doctor successfully", async () => {
      const res = await request(app)
        .post("/api/auth/doctor_signup")
        .send(test_doctor);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty("doctor");
      expect(res.body.user.email).toBe(test_doctor.email);
      expect(res.body.user.role).toBe("DOCTOR");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("should reject duplicate doctor email", async () => {
      const res = await request(app)
        .post("/api/auth/doctor_signup")
        .send(test_doctor);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("email already exists");
    });
  });

  // ==================== LOGIN ====================
  describe("POST /api/auth/login", () => {
    test("should login successfully with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: test_user.email, password: test_user.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("login successful");
      expect(res.body.user).toHaveProperty("role");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("should fail with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: test_user.email, password: "wrong_password" });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should fail with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@test.com", password: "1234abcd" });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== REFRESH TOKEN ====================
  describe("POST /api/auth/refresh_token", () => {
    test("should refresh tokens with valid refresh token cookie", async () => {
      // login first to get cookies
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: test_user.email, password: test_user.password });

      const cookies = loginRes.headers["set-cookie"];

      const res = await request(app)
        .post("/api/auth/refresh_token")
        .set("Cookie", cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("should fail without refresh token cookie", async () => {
      const res = await request(app).post("/api/auth/refresh_token");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== EXCHANGE CODE ====================
  describe("POST /api/auth/exchange_code", () => {
    test("should fail with invalid exchange code", async () => {
      const res = await request(app)
        .post("/api/auth/exchange_code")
        .send({ code: "invalid_code_12345" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should fail with missing code", async () => {
      const res = await request(app).post("/api/auth/exchange_code").send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== SET ROLE ====================
  describe("POST /api/auth/set_role", () => {
    test("should fail without authorization header", async () => {
      const res = await request(app)
        .post("/api/auth/set_role")
        .send({ role: "PATIENT" });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should fail with invalid token", async () => {
      const res = await request(app)
        .post("/api/auth/set_role")
        .set("Authorization", "Bearer invalid_token")
        .send({ role: "PATIENT" });

      expect(res.statusCode).toBe(500);
    });
  });
});
