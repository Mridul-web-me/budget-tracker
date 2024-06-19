import { PrismaClient } from '@prisma/client';

const prismaClientSingLeton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingLeton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingLeton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
