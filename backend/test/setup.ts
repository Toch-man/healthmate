import prisma from "../src/db.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper to create a test user and return cookies
export const createTestUser = async (overrides: Record<string, any> = {}) => {
  const email = overrides.email || `testuser_${Date.now()}@gmail.com`;
  const password = overrides.password || "testpassword123";
  const role = overrides.role || "PATIENT";

  const hash_password = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hash_password,
      role,
    },
  });

  // Create profile based on role
  if (role === "PATIENT") {
    await prisma.patient.create({
      data: {
        user_id: user.id,
        first_name: overrides.first_name || "Test",
        last_name: overrides.last_name || "User",
        date_of_birth: overrides.date_of_birth || new Date("2000-01-01"),
        gender: overrides.gender || "MALE",
        phone: overrides.phone || "09059395160",
      },
    });
  } else if (role === "DOCTOR") {
    await prisma.doctor.create({
      data: {
        user_id: user.id,
        first_name: overrides.first_name || "Doctor",
        last_name: overrides.last_name || "Test",
        phone: overrides.phone || "09059395161",
        gender: overrides.gender || "MALE",
        specialization: overrides.specialization || "General",
        yearsExperience: overrides.yearsExperience || 5,
        location: overrides.location || "Lagos",
        licenseNumber: overrides.licenseNumber || "LIC12345",
        status: "APPROVED",
      },
    });
  }

  // Generate access token for use in auth headers or cookies
  const access_token = jwt.sign(
    { user_id: user.id, role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15min" },
  );

  const refresh_token = jwt.sign(
    { user_id: user.id, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" },
  );

  return {
    user,
    access_token,
    refresh_token,
    email,
    password,
    // Return cookie string for supertest
    cookie: `access_token=${access_token}; refresh_token=${refresh_token}`,
  };
};

// Helper to clean up test users by email
export const cleanupUsers = async (emails: string[]) => {
  for (const email of emails) {
    await prisma.patient.deleteMany({
      where: { user: { email } },
    });
    await prisma.doctor.deleteMany({
      where: { user: { email } },
    });
    await prisma.appointment.deleteMany({
      where: { patient: { user: { email } } },
    });
    await prisma.appointment.deleteMany({
      where: { doctor: { user: { email } } },
    });
    await prisma.healthRecord.deleteMany({
      where: { patient: { user: { email } } },
    });
    await prisma.refresh_token.deleteMany({
      where: { token: { contains: email } },
    });
    await prisma.user.deleteMany({
      where: { email },
    });
  }
};
