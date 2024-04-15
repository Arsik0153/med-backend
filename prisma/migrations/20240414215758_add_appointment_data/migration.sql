-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'offline';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "iin" TEXT,
ADD COLUMN     "phoneNumber" TEXT;
