import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.notFoundLog.findMany({
      orderBy: { lastAccessed: 'desc' }
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching 404 logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      await prisma.notFoundLog.deleteMany({});
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error clearing 404 logs:', error);
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 });
  }
}
