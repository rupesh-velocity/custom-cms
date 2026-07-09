import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const fullUrl = searchParams.get('fullUrl');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Try exact match first (both relative path and absolute fullUrl)
    let redirection = await prisma.redirection.findFirst({
      where: {
        OR: [
          { sourceUrl: path },
          ...(fullUrl ? [{ sourceUrl: fullUrl }] : [])
        ],
        status: true
      }
    });

    // If no exact match, try case-insensitive match
    if (!redirection) {
      const caseInsensitiveRedirects = await prisma.redirection.findMany({
        where: {
          ignoreCase: true,
          status: true
        }
      });
      
      const lowerPath = path.toLowerCase();
      const lowerFullUrl = fullUrl ? fullUrl.toLowerCase() : '';
      
      redirection = caseInsensitiveRedirects.find(r => 
        r.sourceUrl.toLowerCase() === lowerPath || 
        (lowerFullUrl && r.sourceUrl.toLowerCase() === lowerFullUrl)
      ) || null;
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
