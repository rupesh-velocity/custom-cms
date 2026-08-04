import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.notFoundLog.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting 404 log:', error);
    return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 });
  }
}
