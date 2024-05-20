import { PrismaClient } from "@prisma/client";

declare global {
  //This declaration allows you to use the prisma variable throughout your application without the need for explicit imports in every module.
  var prisma: PrismaClient | undefined;
}

// --- The global prisma is only there to ensure hot reloading does not create new PrismaClient instances.----
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
 