import bcrypt from "bcrypt";
import prisma from "../src/db.ts";
import { create } from "domain";

async function main() {
  const hash_password = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL!,
      password: hash_password,
      role: "ADMIN",
      admin: {
        create: {
          first_name: "Tochukwu",
          last_name: "Okeakpu",
        },
      },
    },
  });

  console.log("admin created ", admin.email);

  main()
    .catch((err) => {
      console.error(err);
    })
    .finally(() => prisma.$disconnect());
}
