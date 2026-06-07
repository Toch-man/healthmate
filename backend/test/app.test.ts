import request from "supertest";
import app from "../app.ts";
import { describe, test, expect } from "@jest/globals";

describe("GET /test", () => {
  test("is server ready", async () => {
    const res = await request(app)
      .get("/test")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.message).toBe("test route working");
  });
});
