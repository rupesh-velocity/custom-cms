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
  const [settings, setSettings] = useState<any>(
    form?.settings ? JSON.parse(form.settings) : {
      submitText: 'Submit Form',
      successAction: 'message',
      successMessage: 'Your submission has been received successfully.',
      redirectUrl: '',
      enableHoneypot: true,
      enableRecaptchaV3: false,
      recaptchaSiteKey: '',
      recaptchaSecretKey: ''
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

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
      const payload = { title, notificationEmail, fields, settings, status };
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
                        <option value="file">File Upload</option>
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

                  <button onClick={() => setActiveFieldId(activeFieldId === field.id ? null : field.id)} className="text-[#5e3fde] hover:underline text-xs mt-3 block font-medium">
                    {activeFieldId === field.id ? 'Hide Details' : 'Advanced Details'}
                  </button>

                  {activeFieldId === field.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder Text</label>
                        <input type="text" value={field.placeholder || ''} onChange={e => updateField(field.id, 'placeholder', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde] focus:border-[#5e3fde]" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Default Value</label>
                        <input type="text" value={field.defaultValue || ''} onChange={e => updateField(field.id, 'defaultValue', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde] focus:border-[#5e3fde]" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description / Help Text</label>
                        <input type="text" value={field.description || ''} onChange={e => updateField(field.id, 'description', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde] focus:border-[#5e3fde]" />
                      </div>
                      
                      {/* Conditional Logic */}
                      <div className="col-span-2 border-t border-gray-200 pt-3 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input 
                            type="checkbox" 
                            checked={field.conditionalLogic?.enabled || false}
                            onChange={e => updateField(field.id, 'conditionalLogic', { ...field.conditionalLogic, enabled: e.target.checked })}
                            className="rounded text-[#5e3fde] focus:ring-[#5e3fde]"
                          />
                          <span className="text-sm font-medium text-gray-700">Enable Conditional Logic</span>
                        </label>
                        {field.conditionalLogic?.enabled && (
                          <div className="flex items-wrap items-center gap-2 bg-gray-100 p-3 rounded-lg overflow-hidden">
                            <span className="text-sm text-gray-600 shrink-0">Show if</span>
                            <select 
                              value={field.conditionalLogic.fieldId || ''}
                              onChange={e => updateField(field.id, 'conditionalLogic', { ...field.conditionalLogic, fieldId: e.target.value })}
                              className="px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde] focus:border-[#5e3fde] flex-1 min-w-[120px]"
                            >
                              <option value="">Select a field...</option>
                              {fields.filter((f: any) => f.id !== field.id).map((f: any) => (
                                <option key={f.id} value={f.id}>{f.label || f.id}</option>
                              ))}
                            </select>
                            <span className="text-sm text-gray-600 shrink-0">equals</span>
                            <input 
                              type="text"
                              value={field.conditionalLogic.equals || ''}
                              onChange={e => updateField(field.id, 'conditionalLogic', { ...field.conditionalLogic, equals: e.target.value })}
                              placeholder="Value..."
                              className="px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-[#5e3fde] focus:border-[#5e3fde] flex-1 min-w-[120px]"
                            />
                          </div>
                        )}
                      </div>

                    </div>
                  )}
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
              <button onClick={() => addField('file')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1"><Plus size={14} /> Add File Upload</button>
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

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submit Button Text</label>
                  <input 
                    type="text" 
                    value={settings.submitText}
                    onChange={e => setSettings({...settings, submitText: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde]"
                  />
                </div>
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
                      rows={3}
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

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Spam Protection</h4>
                  
                  <label className="flex items-start gap-3 cursor-pointer mb-4">
                    <input 
                      type="checkbox" 
                      checked={settings.enableHoneypot}
                      onChange={e => setSettings({...settings, enableHoneypot: e.target.checked})}
                      className="rounded text-[#5e3fde] focus:ring-[#5e3fde] mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">Honeypot (Invisible Trap)</span>
                      <p className="text-xs text-gray-500">Injects a hidden field. If filled by a bot, submission is silently rejected.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer mb-2">
                    <input 
                      type="checkbox" 
                      checked={settings.enableRecaptchaV3}
                      onChange={e => setSettings({...settings, enableRecaptchaV3: e.target.checked})}
                      className="rounded text-[#5e3fde] focus:ring-[#5e3fde] mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">Google reCAPTCHA v3</span>
                      <p className="text-xs text-gray-500">Invisible score-based bot protection. Requires backend verification.</p>
                    </div>
                  </label>
                  
                  {settings.enableRecaptchaV3 && (
                    <div className="mt-3 ml-7 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Site Key</label>
                        <input 
                          type="text" 
                          autoComplete="off"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          value={settings.recaptchaSiteKey || ''}
                          onChange={e => setSettings({...settings, recaptchaSiteKey: e.target.value})}
                          placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-[#5e3fde]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Secret Key</label>
                        <input 
                          type="password" 
                          autoComplete="new-password"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          value={settings.recaptchaSecretKey || ''}
                          onChange={e => setSettings({...settings, recaptchaSecretKey: e.target.value})}
                          placeholder="••••••••••••••••••••••••••••••••••••••••"
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-[#5e3fde]"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Required to verify the v3 token securely on the server.</p>
                      </div>
                    </div>
                  )}
                </div>
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
