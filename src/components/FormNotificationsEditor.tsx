'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function FormNotificationsEditor({ form }: { form: any }) {
  const router = useRouter();
  const [notificationEmail, setNotificationEmail] = useState(form.notificationEmail || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { 
        notificationEmail, 
        settings: typeof form.settings === 'string' ? JSON.parse(form.settings || '{}') : form.settings,
        status: form.status,
        fields: typeof form.fields === 'string' ? JSON.parse(form.fields || '[]') : form.fields,
        title: form.title
      };
      
      const res = await fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      toast.success('Notifications saved');
      router.refresh();
    } catch (error) {
      toast.error('Error saving notifications');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm max-w-3xl">
      <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#5e3fde] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#4b32b2] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Notifications'}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notification Emails</label>
          <input 
            type="text" 
            value={notificationEmail}
            onChange={e => setNotificationEmail(e.target.value)}
            placeholder="admin@example.com, sales@example.com"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde]"
          />
          <p className="text-xs text-gray-500 mt-1">Send submissions to these addresses (comma separated).</p>
        </div>
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
          <strong>Note:</strong> Multiple dynamic notifications and user auto-responders logic will be added here in the future as per the architecture plan.
        </div>
      </div>
    </div>
  );
}
