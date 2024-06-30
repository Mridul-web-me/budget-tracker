import prisma from '@/lib/prisma';
import { OverviewQuerySchema } from '@/schema/overview';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect('/sing-in');
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const queryParams = OverviewQuerySchema.safeParse({ from, to });
  if (!queryParams.success) {
    throw new Error(queryParams.error.message);
  }

  const stats = await getCategoriesStat(user.id, queryParams.data.from, queryParams.data.to);
  return Response.json(stats);
}

export type getCategoriesStatResponseType = Awaited<ReturnType<typeof getCategoriesStat>>;

async function getCategoriesStat(userId: string, from: Date, to: Date) {
  const stats = await prisma.transaction.groupBy({
    by: ['type', 'category', 'categoryIcon'],
    where: {
      userId,
      date: {
        gte: from,
        lte: to
      }
    },
    _sum: {
      amount: true
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    }
  });

  return stats;
}
