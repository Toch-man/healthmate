import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../src/db.ts";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const log_in = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: true,
        hospital: true,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "invalid email",
      });
    }

    //compare password
    const is_match = await bcrypt.compare(password, user.password!);

    if (!is_match) {
      return res.status(401).json({
        success: false,
        message: "incorrect password",
      });
    }

    //generate access token
    const access_token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15min" },
    );

    const refresh_token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    await prisma.refresh_token.create({
      data: {
        token: refresh_token,
        user_id: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    //send cookie
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      success: true,
      message: "login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.patient || user.doctor || user.hospital,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

export const google_callback = async (req: Request, res: Response) => {
  const user = req.user as any;

  const one_time_code = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      one_time_code: one_time_code,
      one_time_code_expires: new Date(Date.now() + 60 * 1000),
    },
  });

  // redirect with code
  return res.redirect(
    `${process.env.CLIENT_URL}/auth/callback?code=${one_time_code}`,
  );
};

export const exchange_code = async (req: Request, res: Response) => {
  const { code } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      one_time_code: code,
    },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "invalid code or expired, try again",
    });
    //log user out in FE after this
  }

  const access_token = jwt.sign(
    { user_id: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15min" },
  );

  const refresh_token = jwt.sign(
    { user_id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" },
  );

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 15,
  });

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  await prisma.refresh_token.create({
    data: {
      token: refresh_token,
      user_id: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return res.status(200).json({
    success: true,
    message: "login succesful",
  });
};

export const set_role = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    // get temp token from header
    const temp_token = req.headers.authorization?.split(" ")[1];
    if (!temp_token) {
      return res.status(401).json({
        success: false,
        message: "no token provided",
      });
    }

    // verify temp token
    const decoded = jwt.verify(temp_token, process.env.JWT_SECRET!) as {
      user_id: string;
      needs_role: boolean;
    };

    if (!decoded.needs_role) {
      return res.status(400).json({
        success: false,
        message: "role already set",
      });
    }

    // update user role
    const user = await prisma.user.update({
      where: { id: decoded.user_id },
      data: { role: role },
    });

    // create profile based on role
    if (role === "PATIENT") {
      await prisma.patient.create({
        data: {
          user_id: user.id,
          first_name: "",
          last_name: "",
          date_of_birth: new Date(),
          gender: "OTHERS",
        },
      });
    } else if (role === "DOCTOR") {
      await prisma.doctor.create({
        data: {
          user_id: user.id,
          first_name: "",
          last_name: "",
          phone: "",
          gender: "OTHERS",
          specialization: "",
          yearsExperience: 0,
          location: "",
          licenseNumber: "",
        },
      });
    } else if (role === "HOSPITAL") {
      await prisma.hospital.create({
        data: {
          user_id: user.id,
          name: "",
          email: user.email,
          phone: "",
          address: "",
          state: "",
          license_number: "",
        },
      });
    }

    // generate real tokens now
    const access_token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const refresh_token = jwt.sign(
      { user_id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    // save refresh token to DB
    await prisma.refresh_token.create({
      data: {
        token: refresh_token,
        user_id: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // send cookies
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      success: true,
      message: "role set successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

export const patient_signup = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
    } = req.body;

    //check if user exist
    const existing_user = await prisma.user.findUnique({ where: { email } });

    if (existing_user)
      return res.status(409).json({
        success: true,
        message: "email already exist",
      });

    //hash password
    const hash_password = await bcrypt.hash(password, 10);

    //create user and patient together
    const user = await prisma.user.create({
      data: {
        email,
        password: hash_password,
        role: "PATIENT",
        patient: {
          create: {
            first_name,
            last_name,
            date_of_birth: new Date(date_of_birth),
            gender,
            phone,
          },
        },
      },
      include: { patient: true },
    });

    //generate token
    const access_token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15min" },
    );

    const refresh_token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    await prisma.refresh_token.create({
      data: {
        token: refresh_token,
        user_id: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    //send token as cookie
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 ** 24 * 7,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfuly",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        patient: user.patient,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

export const doctor_signup = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      gender,
      specialization,
      yearsExperience,
      location,
      licenseNumber,
    } = req.body;

    // check if user already exists
    const existing_user = await prisma.user.findUnique({ where: { email } });
    if (existing_user) {
      return res.status(400).json({
        success: false,
        message: "email already exists",
      });
    }

    // hash password
    const hash_password = await bcrypt.hash(password, 10);

    // create user and doctor together
    const user = await prisma.user.create({
      data: {
        email,
        password: hash_password,
        role: "DOCTOR",
        doctor: {
          create: {
            first_name,
            last_name,
            phone,
            gender,
            specialization,
            yearsExperience: parseInt(yearsExperience),
            location,
            licenseNumber,
          },
        },
      },
      include: { doctor: true },
    });

    // generate tokens
    const access_token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const refresh_token = jwt.sign(
      { user_id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    // save refresh token to DB
    await prisma.refresh_token.create({
      data: {
        token: refresh_token,
        user_id: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // send cookies
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor account created successfully — pending approval",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        doctor: user.doctor,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

export const refresh_token = async (req: Request, res: Response) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: "no refresh token",
      });
    }

    // verify token signature — throws TokenExpiredError or JsonWebTokenError
    let decoded: { user_id: string };
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!) as {
        user_id: string;
      };
    } catch (err: any) {
      // distinguish expired vs tampered/invalid
      if (err.name === "TokenExpiredError") {
        // clean it up from DB since we know its expired
        await prisma.refresh_token.deleteMany({
          where: { token: refresh_token },
        });
        return res.status(401).json({
          success: false,
          message: "refresh token expired, please login again",
        });
      }
      // signature mismatch, tampered token, completely invalid
      return res.status(403).json({
        success: false,
        message: "invalid refresh token",
      });
    }

    // check it exists in DB
    const saved_token = await prisma.refresh_token.findUnique({
      where: { token: refresh_token },
    });

    if (!saved_token) {
      // token passed jwt.verify but isn't in DB
      // this means it was already rotated or manually revoked
      return res.status(403).json({
        success: false,
        message: "refresh token reuse detected, please login again",
      });
    }

    // get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "user not found",
      });
    }

    // generate new access token
    const new_access_token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    // generate new refresh token — rotation
    const new_refresh_token = jwt.sign(
      { user_id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    // delete old refresh token from DB
    await prisma.refresh_token.delete({
      where: { token: refresh_token },
    });

    // save new refresh token to DB
    await prisma.refresh_token.create({
      data: {
        token: new_refresh_token,
        user_id: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // send both new cookies
    res.cookie("access_token", new_access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refresh_token", new_refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      success: true,
      message: "tokens refreshed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};
