import { PrismaClient } from '@prisma/client'
import env from '../env/config.ts'

const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error'] : []
})

export default prisma