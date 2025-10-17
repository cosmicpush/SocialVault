import { PrismaClient } from '@prisma/client'
import { resolveDbPath } from './db-path'

// Initialize Prisma Client with the resolved database URL
let prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDbPath(),
      },
    },
  })

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma
}

export default prisma
