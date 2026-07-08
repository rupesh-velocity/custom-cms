import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params;
    const { name, regions, methods } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Use transaction to update zone and recreate methods
    const updatedZone = await prisma.$transaction(async (tx) => {
      // 1. Update the zone basic info
      const zone = await tx.shippingZone.update({
        where: { id: parseInt(id) },
        data: {
          name,
          regions: JSON.stringify(regions || []),
        }
      });

      // 2. If methods array is provided, sync them
      if (methods && Array.isArray(methods)) {
        // Delete existing methods
        await tx.shippingMethod.deleteMany({
          where: { zoneId: parseInt(id) }
        });

        // Insert new methods
        if (methods.length > 0) {
          await tx.shippingMethod.createMany({
            data: methods.map((m: any) => ({
              zoneId: parseInt(id),
              name: m.name,
              type: m.type,
              cost: parseFloat(m.cost) || 0,
              conditions: m.conditions || null,
              enabled: m.enabled !== false
            }))
          });
        }
      }

      // 3. Return the fully updated zone with methods
      return tx.shippingZone.findUnique({
        where: { id: parseInt(id) },
        include: { methods: true }
      });
    });

    return NextResponse.json(updatedZone);
  } catch (error) {
    console.error('Failed to update shipping zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.shippingZone.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete shipping zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
