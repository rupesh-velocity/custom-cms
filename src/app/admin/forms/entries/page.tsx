import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AllEntriesPage() {
  const submissions = await prisma.formSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      form: { select: { title: true } }
    }
  });

  return (
    <div className="max-w-[1200px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">All Form Entries</h1>
          <p className="text-sm text-gray-500">View submissions across all forms</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Form Name</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Date Submitted</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submission Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map(sub => {
                let parsedData = {};
                try { parsedData = JSON.parse(sub.data); } catch(e) {}
                
                return (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      <Link href={`/admin/forms/${sub.formId}/submissions`} className="text-[#5e3fde] hover:underline">
                        {sub.form?.title || 'Unknown Form'}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {Object.entries(parsedData).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-semibold text-gray-900">{key}:</span> {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-500">
                    No submissions found.
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
