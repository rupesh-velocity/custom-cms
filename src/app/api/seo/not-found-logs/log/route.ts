import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Upsert log: if exists, increment hits and update lastAccessed. If not, create.
    await prisma.notFoundLog.upsert({
      where: { url },
      update: {
        hits: { increment: 1 },
        lastAccessed: new Date(),
      },
      create: {
        url,
        hits: 1,
        lastAccessed: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging 404:', error);
    return NextResponse.json({ error: 'Failed to log 404' }, { status: 500 });
  }
}
