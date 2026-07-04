import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'seo_',
        }
      }
    });

    // Convert array of {key, value} to an object
    const settingsObj = settings.reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value || '';
      return acc;
    }, {});

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // data is an object like { seo_nofollow_external: 'true', seo_robots_txt: '...' }
    // We will upsert each key
    
    const transactions = Object.entries(data).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await prisma.$transaction(transactions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving SEO settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
