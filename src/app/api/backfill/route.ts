import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      orderBy: { id: 'asc' }
    });

    if (!user) {
      return NextResponse.json({ error: 'No users found in database' }, { status: 404 });
    }

    const courseResult = await prisma.course.updateMany({
      where: { authorId: null },
      data: { authorId: user.id }
    });

    const productResult = await prisma.product.updateMany({
      where: { authorId: null },
      data: { authorId: user.id }
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${courseResult.count} courses and ${productResult.count} products to belong to ${user.firstName || user.username}.`,
      user: user.id
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to backfill' }, { status: 500 });
  }
}
