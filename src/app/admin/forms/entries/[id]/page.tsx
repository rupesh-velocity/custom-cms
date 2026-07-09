import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ViewEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const deleteSubmission = async () => {
    'use server';
    const formSubmission = await prisma.formSubmission.findUnique({ where: { id: parseInt(id) } });
    if (formSubmission) {
      await prisma.formSubmission.delete({ where: { id: parseInt(id) } });
    }
    redirect('/admin/forms/entries');
  };

  const submission = await prisma.formSubmission.findUnique({
    where: { id: parseInt(id) },
    include: { form: true }
  });

  if (!submission) notFound();

  let parsedData: Record<string, any> = {};
  try { parsedData = JSON.parse(submission.data); } catch(e) {}

  let fields: any[] = [];
  try { fields = JSON.parse(submission.form.fields || '[]'); } catch(e) {}

  // Get total submissions for this form to show "Entry X of Y" (Mocked for now)
  const totalSubmissions = await prisma.formSubmission.count({ where: { formId: submission.formId } });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Entries</h1>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          Entry 1 of {totalSubmissions}
          <div className="flex gap-1 ml-2">
            <button className="p-1 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600"><ChevronLeft size={16} /></button>
            <button className="p-1 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-[13px] font-semibold text-gray-700">{submission.form.title} : Entry # {submission.id}</h2>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                show empty fields
              </label>
            </div>
            
            <div className="p-0">
              {fields.map((field, index) => {
                const value = parsedData[field.id];
                if (!value) return null; // hide empty fields by default
                
                return (
                  <div key={field.id} className={`p-4 ${index !== fields.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="text-[13px] font-bold text-gray-800 mb-2">{field.label}</div>
                    <div className="text-[13px] text-gray-700">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Meta */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-[13px] font-semibold text-gray-700">Entry</h2>
              <div className="flex items-center gap-1 text-gray-400">
                <ChevronUp size={16} />
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="p-4 text-[13px] text-gray-700 space-y-4">
              <div>Entry Id: {submission.id}</div>
              <div>Submitted on: {new Date(submission.createdAt).toLocaleString()}</div>
              <div>User IP: 127.0.0.1</div>
              <div>User: <span className="text-[#0071a1] hover:underline cursor-pointer">admin</span></div>
              <div>Embed Url: <Link href="/" className="text-[#0071a1] hover:underline">.../contact-us</Link></div>
              <div>Edit Post: <Link href="/" className="text-[#0071a1] hover:underline">Contact Page</Link></div>
              
              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                <form action={deleteSubmission} className="flex gap-2">
                  <button type="submit" className="text-[#b32d2e] hover:underline">Move to Trash</button>
                  <span className="text-gray-300">|</span>
                  <button type="submit" className="text-[#b32d2e] hover:underline">Mark as Spam</button>
                </form>
                <button className="border border-[#0071a1] text-[#0071a1] px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
