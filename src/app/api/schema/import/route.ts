import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    // Basic validation
    new URL(targetUrl);
    
    // Fetch with a generic user agent to bypass simple bot protections
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }, { status: 400 });
    }

    const html = await response.text();
    
    // Extract all <script type="application/ld+json"> blocks
    const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemas: any[] = [];
    
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      try {
        const jsonContent = match[1].trim();
        if (!jsonContent) continue;
        
        const parsed = JSON.parse(jsonContent);
        
        // Handle array of schemas vs single schema object
        if (Array.isArray(parsed)) {
          schemas.push(...parsed);
        } else if (parsed && typeof parsed === 'object') {
          // Sometimes RankMath wraps multiple schemas in a single @graph
          if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
            schemas.push(...parsed['@graph']);
          } else {
            schemas.push(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to parse a JSON-LD block from target URL', e);
      }
    }

    return NextResponse.json({ schemas });
  } catch (error: any) {
    console.error('Error importing schema:', error);
    return NextResponse.json({ error: error.message || 'An error occurred while importing schema' }, { status: 500 });
  }
}
