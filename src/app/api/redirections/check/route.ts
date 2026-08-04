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

    const pathWithoutSlash = path.startsWith('/') ? path.slice(1) : path;
    const pathWithSlash = path.startsWith('/') ? path : `/${path}`;

    // Try exact match first (both relative path and absolute fullUrl)
    let redirection = await prisma.redirection.findFirst({
      where: {
        OR: [
          { sourceUrl: path },
          { sourceUrl: pathWithoutSlash },
          { sourceUrl: pathWithSlash },
          ...(fullUrl ? [{ sourceUrl: fullUrl }] : [])
        ],
        status: true,
        isTrashed: false
      }
    });

    // If no exact match, try case-insensitive match
    if (!redirection) {
      const caseInsensitiveRedirects = await prisma.redirection.findMany({
        where: {
          ignoreCase: true,
          status: true,
          isTrashed: false
        }
      });
      
      const lowerPath = path.toLowerCase();
      const lowerPathWithoutSlash = lowerPath.startsWith('/') ? lowerPath.slice(1) : lowerPath;
      const lowerPathWithSlash = lowerPath.startsWith('/') ? lowerPath : `/${lowerPath}`;
      const lowerFullUrl = fullUrl ? fullUrl.toLowerCase() : '';
      
      redirection = caseInsensitiveRedirects.find(r => 
        r.sourceUrl.toLowerCase() === lowerPath || 
        r.sourceUrl.toLowerCase() === lowerPathWithoutSlash ||
        r.sourceUrl.toLowerCase() === lowerPathWithSlash ||
        (lowerFullUrl && r.sourceUrl.toLowerCase() === lowerFullUrl)
      ) || null;
    }

    if (redirection) {
      // Fire-and-forget background update for metrics
      prisma.redirection.update({
        where: { id: redirection.id },
        data: {
          hits: { increment: 1 },
          lastAccessed: new Date()
        }
      }).catch(e => console.error('Failed to update redirect metrics', e));

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
