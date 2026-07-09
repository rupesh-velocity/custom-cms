import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Try exact match first
    let redirection = await prisma.redirection.findFirst({
      where: {
        sourceUrl: path,
        status: true
      }
    });

    // If no exact match, try case-insensitive match (since ignoreCase is a boolean flag, we have to fetch those and check in memory, or use mode: 'insensitive' but that applies to all)
    if (!redirection) {
      const caseInsensitiveRedirects = await prisma.redirection.findMany({
        where: {
          ignoreCase: true,
          status: true
        }
      });
      
      const lowerPath = path.toLowerCase();
      redirection = caseInsensitiveRedirects.find(r => r.sourceUrl.toLowerCase() === lowerPath) || null;
    }

    if (redirection) {
      return NextResponse.json({
        destinationUrl: redirection.destinationUrl,
        redirectType: redirection.redirectType
      });
    }

    return NextResponse.json({ destinationUrl: null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check redirection' }, { status: 500 });
  }
}
