'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Settings2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FormEditor({ form }: { form?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(form?.title || '');
  const [notificationEmail, setNotificationEmail] = useState(form?.notificationEmail || '');
  const [fields, setFields] = useState<any[]>(
    form?.fields ? JSON.parse(form.fields) : [
      { id: 'field_1', type: 'text', label: 'Name', required: true },
      { id: 'field_2', type: 'email', label: 'Email', required: true }
    ]
  );
  const [status, setStatus] = useState(form?.status || 'Published');
  const [isSaving, setIsSaving] = useState(false);

  const addField = (type: string) => {
    setFields([
      ...fields, 
      { 
        id: `field_${Date.now()}`, 
        type, 
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`, 
        required: false,
        options: type === 'select' ? 'Option 1, Option 2' : undefined
      }
    ]);
  };

  const updateField = (id: string, key: string, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = { title, notificationEmail, fields, status };
      const url = form ? `/api/forms/${form.id}` : '/api/forms';
      const method = form ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      toast.success(form ? 'Form updated' : 'Form created');
      router.push('/admin/forms');
      router.refresh();
    } catch (error) {
      toast.error('Error saving form');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/forms" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{form ? 'Edit Form' : 'Create New Form'}</h1>
        <div className="ml-auto flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#5e3fde] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#4b32b2] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <input 
              type="text" 
              placeholder="Form Title" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-2xl font-bold border-none outline-none placeholder-gray-300 focus:ring-0 px-0 mb-4"
            />
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="relative p-4 bg-gray-50 border border-gray-200 rounded-lg group">
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => removeField(field.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Field Label</label>
                      <input 
                        type="text" 
                        value={field.label} 
                        onChange={e => updateField(field.id, 'label', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde] focus:border-[#5e3fde]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Field Type</label>
                      <select 
                        value={field.type}
                        onChange={e => updateField(field.id, 'type', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde] focus:border-[#5e3fde]"
                      >
                        <option value="text">Text (Single Line)</option>
                        <option value="email">Email</option>
                        <option value="textarea">Textarea (Multi Line)</option>
                        <option value="select">Dropdown Select</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="number">Number</option>
                        <option value="tel">Phone</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                  </div>
                  
                  {['select', 'radio', 'checkbox'].includes(field.type) && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Options (comma separated)</label>
                      <input 
                        type="text" 
                        value={field.options || ''} 
                        onChange={e => updateField(field.id, 'options', e.target.value)}
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde] focus:border-[#5e3fde]"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={field.required}
                      onChange={e => updateField(field.id, 'required', e.target.checked)}
                      className="rounded text-[#5e3fde] focus:ring-[#5e3fde]"
                    />
                    <span className="text-sm text-gray-700">Required field</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => addField('text')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Text</button>
              <button onClick={() => addField('email')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Email</button>
              <button onClick={() => addField('textarea')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Textarea</button>
              <button onClick={() => addField('select')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Dropdown</button>
              <button onClick={() => addField('radio')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Radio</button>
              <button onClick={() => addField('checkbox')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Checkbox</button>
              <button onClick={() => addField('number')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Number</button>
              <button onClick={() => addField('tel')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Phone</button>
              <button onClick={() => addField('date')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add Date</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Settings2 size={18} /> Form Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde]"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Emails</label>
                <p className="text-xs text-gray-500 mb-2">Send submissions to these addresses (comma separated).</p>
                <input 
                  type="text" 
                  value={notificationEmail}
                  onChange={e => setNotificationEmail(e.target.value)}
                  placeholder="admin@example.com, sales@example.com"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde]"
                />
              </div>

              {form && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shortcode</label>
                  <code className="block bg-gray-50 text-[#5e3fde] px-3 py-2 rounded text-sm font-mono border border-gray-200 break-all">
                    {form.shortcode}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
