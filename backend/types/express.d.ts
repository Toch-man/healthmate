export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string | null;
      google_id: string | null;
      one_time_code: string | null;
      one_time_code_expires: Date | null;
      createdAt: Date;
      updatedAt: Date;
      password: string | null;
    }
    interface Request {
      user?: User;
    }
  }
}
