'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function FormNotificationsEditor({ form }: { form: any }) {
  const router = useRouter();
  const settingsObj = typeof form.settings === 'string' ? JSON.parse(form.settings || '{}') : (form.settings || {});
  const [notifications, setNotifications] = useState<any[]>(settingsObj.notifications || [{ name: 'Admin Notification', to: form.notificationEmail || '', subject: 'New Submission', message: '{all_fields}' }]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { 
        settings: { ...settingsObj, notifications },
        status: form.status,
        fields: typeof form.fields === 'string' ? JSON.parse(form.fields || '[]') : form.fields,
        title: form.title,
        notificationEmail: notifications[0]?.to || ''
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Configured Notifications</h3>
          <button 
            onClick={() => setNotifications([...notifications, { name: 'New Notification', to: '{email}', subject: 'New Submission', message: 'All fields: {all_fields}' }])}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
          >
            + Add Notification
          </button>
        </div>

        {notifications.map((notif: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-5 relative group">
            <button 
              onClick={() => setNotifications(notifications.filter((_: any, i: number) => i !== index))}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              Delete
            </button>
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notification Name</label>
                <input 
                  type="text" 
                  value={notif.name}
                  onChange={e => {
                    const newN = [...notifications];
                    newN[index].name = e.target.value;
                    setNotifications(newN);
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Send To Email</label>
                  <input 
                    type="text" 
                    value={notif.to}
                    onChange={e => {
                      const newN = [...notifications];
                      newN[index].to = e.target.value;
                      setNotifications(newN);
                    }}
                    placeholder="admin@example.com or {email}"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email Subject</label>
                  <input 
                    type="text" 
                    value={notif.subject}
                    onChange={e => {
                      const newN = [...notifications];
                      newN[index].subject = e.target.value;
                      setNotifications(newN);
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Message Body</label>
                <textarea 
                  value={notif.message}
                  onChange={e => {
                    const newN = [...notifications];
                    newN[index].message = e.target.value;
                    setNotifications(newN);
                  }}
                  rows={4}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
