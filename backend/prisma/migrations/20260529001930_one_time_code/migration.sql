/*
  Warnings:

  - Added the required column `one_time_code_expires` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "one_time_code" TEXT,
ADD COLUMN     "one_time_code_expires" TIMESTAMP(3) NOT NULL;
