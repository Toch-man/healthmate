// wipe.ts
import prisma from "./src/db.ts";

async function main() {
  // delete children before parents, to respect foreign key constraints
  await prisma.chatMessage.deleteMany();
  await prisma.healthRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refresh_token.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  console.log("all data wiped, schema untouched");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
