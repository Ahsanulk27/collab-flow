import { PrismaClient } from "../generated/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Create PrismaClient instance if it doesn't exist
const prismaClient = global.prisma || new PrismaClient();

// Store client globally in dev to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

export const prisma = prismaClient;
