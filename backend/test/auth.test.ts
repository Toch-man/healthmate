import {
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  test,
  expect,
} from "@jest/globals";
import app from "../app.ts";
import prisma from "../src/db.ts";
import request from "supertest";

describe("auth routes", () => {
  const test_user = {
    email: "testuser@gmail.com",
    password: "1234abcd",
    first_name: "hello",
    last_name: "world",
    date_of_birth: "2000-01-01",
    gender: "MALE",
    phone: "09059395167",
  };

  beforeAll(async () => {
    // clean up test user before tests run
    // so tests always start fresh
    await prisma.patient.deleteMany({
      where: { user: { email: test_user.email } },
    });
    await prisma.user.deleteMany({
      where: { email: test_user.email },
    });
  });

  beforeEach(async () => {});

  afterAll(async () => {
    // clean up after all tests done
    await prisma.patient.deleteMany({
      where: { user: { email: test_user.email } },
    });
    await prisma.user.deleteMany({
      where: { email: test_user.email },
    });
    await prisma.$disconnect(); // disconnect DB when done
  });

  describe("POST /api/auth/patient_signup", () => {
    test("should register new user", async () => {
      const res = await request(app) // ← must await
        .post("/api/auth/patient_signup")
        .send(test_user);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("user");

      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("should not allow existing user to register", async () => {
      await request(app).post("/api/auth/patient_signup").send(test_user);

      const res = await request(app)
        .post("/api/auth/patient_signup")
        .send(test_user);

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/auth/log_in", () => {
    test("should login user", async () => {
      // signup first so user exists
      await request(app).post("/api/auth/patient_signup").send(test_user);

      const res = await request(app)
        .post("/api/auth/log_in")
        .send({ email: test_user.email, password: test_user.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("should fail with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/log_in")
        .send({ email: test_user.email, password: "hello_world" });

      expect(res.statusCode).toBe(401);
    });

    test("should fail with unknown email", async () => {
      const res = await request(app).post("/api/auth/log_in").send({
        email: "helloworld@gmail.com",
        password: test_user.password,
      });

      expect(res.statusCode).toBe(404);
    });
  });
});
