import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AllEntriesPage({ searchParams }: { searchParams: Promise<{ form_id?: string }> }) {
  const params = await searchParams;
  
  // Fetch all forms for the switcher
  const forms = await prisma.form.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, fields: true }
  });

  if (forms.length === 0) {
    return (
      <div className="max-w-[1200px]">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Form Entries</h1>
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">No forms found. Create a form first to see entries.</p>
          <Link href="/admin/forms/new" className="bg-[#5e3fde] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4b32b2] transition-colors">
            Create Form
          </Link>
        </div>
      </div>
    );
  }

  // Determine active form
  let activeForm = forms[0];
  if (params.form_id) {
    const found = forms.find(f => f.id === parseInt(params.form_id!));
    if (found) activeForm = found;
  } else {
    redirect(`/admin/forms/entries?form_id=${activeForm.id}`);
  }

  // Parse fields to get columns
  let fields: any[] = [];
  try {
    fields = JSON.parse(activeForm.fields || '[]');
  } catch (e) {}

  // Fetch submissions for active form
  const submissions = await prisma.formSubmission.findMany({
    where: { formId: activeForm.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-[1200px]">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Entries</h1>
          <p className="text-sm text-gray-500">View and manage form submissions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Select Form:</label>
          {/* Note: In a real app we might use a Client Component for the select onChange router.push, but for now we can just use a simple form auto-submit or Next Link list, or client-side JS */}
          <div className="relative">
            <select 
              defaultValue={activeForm.id}
              key={activeForm.id} // force re-render if activeForm changes
              id="form-switcher"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm font-medium text-gray-700 min-w-[200px] focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde]"
            >
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  document.getElementById('form-switcher').addEventListener('change', function(e) {
                    window.location.href = '/admin/forms/entries?form_id=' + e.target.value;
                  });
                `
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[180px]">Date Submitted</th>
                {fields.map((field) => (
                  <th key={field.id} className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map(sub => {
                let parsedData: Record<string, any> = {};
                try { parsedData = JSON.parse(sub.data); } catch(e) {}
                
                return (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    {fields.map((field) => (
                      <td key={field.id} className="py-4 px-6 text-sm text-gray-900">
                        {parsedData[field.id] ? (Array.isArray(parsedData[field.id]) ? parsedData[field.id].join(', ') : String(parsedData[field.id])) : '-'}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} className="py-12 text-center text-gray-500">
                    No submissions found for this form.
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
