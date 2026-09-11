// Re-export the canonical Prisma client from src/lib/db/prisma.ts
// Having two separate PrismaClient instances wastes Supabase connection pool slots.
// All imports via @/lib/prisma now share the same singleton connection.
export { prisma as default } from "@/lib/db/prisma"
