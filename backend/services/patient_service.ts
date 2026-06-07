import prisma from "../src/db.ts";

export const find_patient = async (user_id: string) => {
  return await prisma.patient.findUnique({
    where: { user_id },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });
};
