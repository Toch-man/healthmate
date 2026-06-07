//make sure user have a role beforenetering some pages
//chek claude for error mesge an explanation

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const access_token = req.cookies.access_token;

  if (!access_token) {
    return res.status(401).json({
      success: false,
      message: "no token found",
    });
  }
  try {
    const decoded = jwt.verify(
      access_token,
      process.env.JWT_ACCESS_SECRET!,
    ) as { user_id: string; role: string };
    req.user = {
      id: decoded.user_id,
      role: decoded.role,
    } as Express.User; // ← tell TypeScript its fine to do this

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        expired: true,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export const role_allowed = (...allowed_role: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user_role = req.user?.role;

    if (!allowed_role.includes(user_role!)) {
      return res.status(403).json({
        success: false,
        message: "unauthorised access",
      });
    }
    next();
  };
};
