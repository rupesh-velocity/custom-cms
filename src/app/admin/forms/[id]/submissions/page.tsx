import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const form = await prisma.form.findUnique({
    where: { id: parseInt(resolvedParams.id) },
    include: {
      submissions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!form) return notFound();

  const fields = form.fields ? JSON.parse(form.fields as string) : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/forms" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-500 text-sm">For: {form.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                {fields.map((f: any) => (
                  <th key={f.id} className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {form.submissions.map((sub: any) => {
                const data = JSON.parse(sub.data);
                return (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    {fields.map((f: any) => (
                      <td key={f.id} className="py-4 px-6 text-sm text-gray-900">
                        {data[f.id] || '-'}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {form.submissions.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} className="py-12 text-center text-gray-500">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
