'use client';

import { useState, useEffect } from 'react';

export default function FrontendForm({ id }: { id: string }) {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setForm(data);
          const fields = data.fields ? JSON.parse(data.fields) : [];
          const initialData: any = {};
          fields.forEach((f: any) => initialData[f.id] = '');
          setFormData(initialData);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg max-w-2xl mx-auto my-8"></div>;
  if (!form) return null;

  const fields = form.fields ? JSON.parse(form.fields) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: id, data: formData })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] rounded-2xl p-8 text-center my-8 max-w-2xl mx-auto shadow-sm">
        <svg className="w-16 h-16 text-[#22c55e] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
        <p className="text-[#15803d]">Your submission has been received successfully.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-8 sm:p-10 my-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{form.title}</h3>
      
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field: any) => (
          <div key={field.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea 
                required={field.required}
                value={formData[field.id] || ''}
                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all outline-none resize-y"
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select 
                required={field.required}
                value={formData[field.id] || ''}
                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all outline-none appearance-none"
              >
                <option value="">Select an option</option>
                {field.options?.split(',').map((opt: string, i: number) => (
                  <option key={i} value={opt.trim()}>{opt.trim()}</option>
                ))}
              </select>
            ) : (
              <input 
                type={field.type === 'email' ? 'email' : 'text'}
                required={field.required}
                value={formData[field.id] || ''}
                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#5e3fde]/20 focus:border-[#5e3fde] transition-all outline-none"
              />
            )}
          </div>
        ))}
        
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#5e3fde] text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-[#4b32b2] hover:shadow-md transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[15px]"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  );
}
