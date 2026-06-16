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

describe("appointment routes", () => {
  beforeAll(async () => {
    //clean up test user before tests runs
    //so test always start fresh
    await prisma.appointment.deleteMany({
      where: {},
    });

    await prisma.user.deleteMany({
      where: {},
    });
  });

  beforeEach(async () => {});

  afterAll(async () => {
    //clean up after all test done
    await prisma.appointment.deleteMany({
      where: {},
    });

    await prisma.$disconnect();
  });

  describe("POST /api/appointment/book_appointment/:doctor_id", () => {
    test("can i book an appointment", async () => {
      const res = await request(app)
        .post("/api/appointment/book_appointment")
        .send();
    });
  });
});
