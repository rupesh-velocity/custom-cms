import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formId = parseInt(id);

    const form = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      return new NextResponse('Form not found', { status: 404 });
    }

    const submissions = await prisma.formSubmission.findMany({
      where: { formId, status: 'Active' },
      orderBy: { createdAt: 'desc' }
    });

    let fields: any[] = [];
    try {
      fields = JSON.parse(form.fields || '[]');
    } catch (e) {}

    // Build CSV Header
    const header = ['Entry ID', 'Date', ...fields.map(f => `"${String(f.label).replace(/"/g, '""')}"`)].join(',');

    // Build CSV Rows
    const rows = submissions.map(sub => {
      let data: any = {};
      try {
        data = JSON.parse(sub.data || '{}');
      } catch (e) {}

      const rowData = fields.map(f => {
        let val = data[f.id];
        if (Array.isArray(val)) val = val.join(', ');
        val = String(val || '');
        // Escape quotes
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      });

      return [sub.id, `"${new Date(sub.createdAt).toISOString()}"`, ...rowData].join(',');
    });

    const csv = [header, ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="form-${formId}-entries.csv"`
      }
    });
  } catch (error) {
    console.error('Export Error:', error);
    return new NextResponse('Error generating export', { status: 500 });
  }
}
