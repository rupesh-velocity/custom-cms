'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function FormConfirmationsEditor({ form }: { form: any }) {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(
    form.settings ? (typeof form.settings === 'string' ? JSON.parse(form.settings) : form.settings) : {
      successAction: 'message',
      successMessage: 'Your submission has been received successfully.',
      redirectUrl: ''
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { 
        settings,
        status: form.status,
        notificationEmail: form.notificationEmail,
        fields: typeof form.fields === 'string' ? JSON.parse(form.fields || '[]') : form.fields,
        title: form.title
      };
      
      const res = await fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      toast.success('Confirmations saved');
      router.refresh();
    } catch (error) {
      toast.error('Error saving confirmations');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm max-w-3xl">
      <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Default Confirmation</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#5e3fde] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#4b32b2] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Confirmations'}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">On Success</label>
          <select 
            value={settings.successAction}
            onChange={e => setSettings({...settings, successAction: e.target.value})}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde]"
          >
            <option value="message">Show Message</option>
            <option value="redirect">Redirect to URL</option>
          </select>
        </div>
        {settings.successAction === 'message' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
            <textarea 
              value={settings.successMessage}
              onChange={e => setSettings({...settings, successMessage: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde]"
              rows={4}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
            <input 
              type="url" 
              value={settings.redirectUrl}
              onChange={e => setSettings({...settings, redirectUrl: e.target.value})}
              placeholder="https://example.com/thank-you"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde]"
            />
          </div>
        )}
        
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
          <strong>Note:</strong> Multiple conditional confirmations logic will be added here in the future as per the architecture plan.
        </div>
      </div>
    </div>
  );
}
