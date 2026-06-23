import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connection_string = process.env.DATABASE_URL;

if (!connection_string) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const adapter = new PrismaPg({ connectionString: connection_string });

const prisma = new PrismaClient({ adapter });

export default prisma;
