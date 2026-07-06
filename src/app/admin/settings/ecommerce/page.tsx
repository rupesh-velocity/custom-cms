'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, CreditCard, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EcommerceSettingsPage() {
  const [settings, setSettings] = useState({
    stripeEnabled: 'false',
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalEnabled: 'false',
    paypalClientId: '',
    currency: 'USD',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/ecommerce');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/ecommerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('E-commerce settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(s => ({ ...s, [name]: checked ? 'true' : 'false' }));
    } else {
      setSettings(s => ({ ...s, [name]: value }));
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-[1100px] text-[#2c3338]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-normal">E-commerce Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-[#5e3fde] text-white rounded-[3px] text-[13px] hover:bg-[#4b32b2] disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Changes
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-64 shrink-0">
          <div className="bg-white border border-[#c3c4c7] flex flex-col">
            <button 
              onClick={() => setActiveTab('payments')}
              className={`text-left px-4 py-3 border-b border-[#c3c4c7] text-[14px] flex items-center gap-2 ${activeTab === 'payments' ? 'bg-[#f6f7f7] font-semibold border-l-4 border-l-[#5e3fde]' : 'hover:bg-[#f6f7f7]'}`}
            >
              <CreditCard size={18} /> Payment Gateways
            </button>
            <button 
              onClick={() => setActiveTab('shipping')}
              className={`text-left px-4 py-3 border-b border-[#c3c4c7] text-[14px] flex items-center gap-2 ${activeTab === 'shipping' ? 'bg-[#f6f7f7] font-semibold border-l-4 border-l-[#5e3fde]' : 'hover:bg-[#f6f7f7]'}`}
            >
              <Truck size={18} /> Shipping Zones
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-[#c3c4c7] p-6">
          {activeTab === 'payments' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4">Currency Settings</h2>
                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                  <label className="text-[13px] font-semibold">Store Currency</label>
                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                    className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-xs focus:border-[#5e3fde] outline-none"
                  >
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="CAD">Canadian Dollar ($)</option>
                    <option value="AUD">Australian Dollar ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4 flex items-center gap-3">
                  <input type="checkbox" name="stripeEnabled" checked={settings.stripeEnabled === 'true'} onChange={handleChange} className="w-4 h-4" />
                  Stripe (Credit Cards)
                </h2>
                {settings.stripeEnabled === 'true' && (
                  <div className="space-y-4 pl-7">
                    <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                      <label className="text-[13px] font-semibold">Publishable Key</label>
                      <input type="text" name="stripePublicKey" value={settings.stripePublicKey} onChange={handleChange} className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-md focus:border-[#5e3fde] outline-none" />
                    </div>
                    <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                      <label className="text-[13px] font-semibold">Secret Key</label>
                      <input type="password" name="stripeSecretKey" value={settings.stripeSecretKey} onChange={handleChange} className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-md focus:border-[#5e3fde] outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4 flex items-center gap-3">
                  <input type="checkbox" name="paypalEnabled" checked={settings.paypalEnabled === 'true'} onChange={handleChange} className="w-4 h-4" />
                  PayPal
                </h2>
                {settings.paypalEnabled === 'true' && (
                  <div className="space-y-4 pl-7">
                    <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                      <label className="text-[13px] font-semibold">Client ID</label>
                      <input type="text" name="paypalClientId" value={settings.paypalClientId} onChange={handleChange} className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-md focus:border-[#5e3fde] outline-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'shipping' && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Shipping Zones</h2>
              <p className="text-[13px] text-gray-500 mb-6">Manage geographical areas where you ship items to.</p>
              
              <div className="border border-[#c3c4c7] rounded bg-[#f6f7f7] p-12 text-center text-gray-500 text-[14px]">
                Shipping zones module will be implemented in the next step.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
