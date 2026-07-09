import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ViewEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
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

          {/* Notes Section */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-[13px] font-semibold text-gray-700">Notes</h2>
              <div className="flex items-center gap-1 text-gray-400">
                <ChevronUp size={16} />
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <select className="border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-700">
                  <option>Bulk action</option>
                </select>
                <button className="border border-[#0071a1] text-[#0071a1] px-4 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors">Apply</button>
              </div>

              <div className="flex gap-4 mb-4 items-start">
                <input type="checkbox" className="mt-1 rounded border-gray-300" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-[#ff6b00] rounded flex items-center justify-center text-white font-bold text-lg">G</div>
                    <div>
                      <div className="text-[13px] font-medium text-[#0071a1]">Admin Notification (ID: {submission.id}abc)</div>
                      <div className="text-[11px] text-gray-500">added {new Date(submission.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-[#f0f8ec] border border-[#c1e2b3] p-3 rounded text-[13px] text-gray-700 flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#7ad03a] rounded-full flex items-center justify-center text-white">✓</div>
                    WordPress successfully passed the notification email to the sending server.
                  </div>
                </div>
              </div>

              <textarea className="w-full border border-gray-200 rounded p-2 text-[13px] min-h-[80px] focus:outline-none focus:border-[#5e3fde] mb-3"></textarea>
              <div className="flex gap-3">
                <button className="border border-[#0071a1] text-[#0071a1] px-4 py-2 rounded text-xs hover:bg-gray-50 transition-colors">Add Note</button>
                <select className="border border-gray-200 rounded px-3 py-2 text-xs text-gray-700 flex-1">
                  <option>Also email this note to</option>
                </select>
              </div>
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
                <div className="flex gap-2">
                  <button className="text-[#b32d2e] hover:underline">Move to Trash</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-[#b32d2e] hover:underline">Mark as Spam</button>
                </div>
                <button className="border border-[#0071a1] text-[#0071a1] px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">Edit</button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-[13px] font-semibold text-gray-700">Notifications</h2>
              <div className="flex items-center gap-1 text-gray-400">
                <ChevronUp size={16} />
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="p-4">
              <label className="flex items-center gap-2 text-[13px] text-gray-700 mb-3">
                <input type="checkbox" className="rounded border-gray-300" />
                Admin Notification
              </label>
              <button className="border border-[#0071a1] text-[#0071a1] px-4 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors">Resend</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-[13px] font-semibold text-gray-700">Print entry</h2>
              <div className="flex items-center gap-1 text-gray-400">
                <ChevronUp size={16} />
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="p-4">
              <label className="flex items-center gap-2 text-[13px] text-gray-700 mb-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#0071a1] focus:ring-[#0071a1]" />
                Include Notes
              </label>
              <button className="border border-[#0071a1] text-[#0071a1] px-4 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors">Print</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
