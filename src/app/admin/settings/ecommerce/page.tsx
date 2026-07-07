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
    adminEmail: '',
    storeAddress1: '',
    storeAddress2: '',
    storeCity: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

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
    <div className="max-w-[1200px] text-[#2c3338]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-normal">Settings</h1>
      </div>

      {/* WooCommerce style horizontal tabs */}
      <div className="flex border-b border-[#c3c4c7] mb-6 overflow-x-auto scrollbar-hide">
        {['General', 'Shipping', 'Payments', 'Emails'].map(tab => {
          const tabId = tab.toLowerCase();
          const displayActiveTab = activeTab === 'payments' ? 'payments' : activeTab;
          
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-4 py-2 text-[14px] font-medium whitespace-nowrap transition-colors ${
                displayActiveTab === tabId 
                  ? 'text-[#5e3fde] border-b-2 border-[#5e3fde] -mb-[1px]' 
                  : 'text-gray-600 hover:text-[#5e3fde]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-[#c3c4c7] p-8">
        {activeTab === 'general' && (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4">Store Address</h2>
            <p className="text-[13px] text-gray-500 mb-6">This is where your business is located. Tax rates and shipping rates will use this address.</p>
            
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <label className="text-[13px] font-semibold text-gray-700">Address line 1</label>
              <input type="text" name="storeAddress1" value={(settings as any).storeAddress1 || ''} onChange={handleChange} className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-md focus:border-[#5e3fde] outline-none" placeholder="e.g. 123 Main St" />
            </div>
            
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <label className="text-[13px] font-semibold text-gray-700">Address line 2</label>
              <input type="text" name="storeAddress2" value={(settings as any).storeAddress2 || ''} onChange={handleChange} className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-md focus:border-[#5e3fde] outline-none" placeholder="Apartment, suite, unit etc. (optional)" />
            </div>

            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <label className="text-[13px] font-semibold text-gray-700">City</label>
              <input type="text" name="storeCity" value={(settings as any).storeCity || ''} onChange={handleChange} className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-md focus:border-[#5e3fde] outline-none" />
            </div>
            
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center pt-8 border-t border-gray-100">
              <label className="text-[13px] font-semibold text-gray-700">Currency options</label>
              <div>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-xs focus:border-[#5e3fde] outline-none mb-2 block"
                >
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="CAD">Canadian Dollar ($)</option>
                  <option value="AUD">Australian Dollar ($)</option>
                </select>
                <p className="text-xs text-gray-500">This controls what currency prices are listed at in the catalog and which currency gateways will take payments in.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-8">
            <p className="text-[13px] text-gray-500 mb-6">Installed payment methods are listed below. Drag and drop to control their display order on the frontend.</p>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-[13px] font-semibold text-gray-700">Method</th>
                  <th className="py-2 text-[13px] font-semibold text-gray-700">Enabled</th>
                  <th className="py-2 text-[13px] font-semibold text-gray-700">Keys</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium flex items-center gap-2"><CreditCard size={16} className="text-gray-400" /> Stripe</td>
                  <td className="py-4">
                    <input type="checkbox" name="stripeEnabled" checked={settings.stripeEnabled === 'true'} onChange={handleChange} className="w-4 h-4 rounded text-[#5e3fde] focus:ring-[#5e3fde]" />
                  </td>
                  <td className="py-4 space-y-2">
                    <input type="text" name="stripePublicKey" value={settings.stripePublicKey} onChange={handleChange} placeholder="Publishable Key" autoComplete="off" className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 w-full max-w-xs block focus:border-[#5e3fde] outline-none" />
                    <input type="text" name="stripeSecretKey" value={settings.stripeSecretKey} onChange={handleChange} placeholder="Secret Key" autoComplete="off" className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 w-full max-w-xs block focus:border-[#5e3fde] outline-none" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium">PayPal</td>
                  <td className="py-4">
                    <input type="checkbox" name="paypalEnabled" checked={settings.paypalEnabled === 'true'} onChange={handleChange} className="w-4 h-4 rounded text-[#5e3fde] focus:ring-[#5e3fde]" />
                  </td>
                  <td className="py-4">
                    <input type="text" name="paypalClientId" value={settings.paypalClientId} onChange={handleChange} placeholder="Client ID" className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 w-full max-w-xs block focus:border-[#5e3fde] outline-none" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'shipping' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Shipping zones</h2>
            <p className="text-[13px] text-gray-500 mb-6">A shipping zone is a geographic region where a certain set of shipping methods and rates apply.</p>
            
            <div className="border border-[#c3c4c7] rounded bg-[#f6f7f7] p-12 text-center text-gray-500 text-[14px]">
              Shipping zones module will be implemented in the next step.
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Email Notifications</h2>
            <p className="text-[13px] text-gray-500 mb-6">Manage how and where order notifications are sent.</p>
            
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <label className="text-[13px] font-semibold text-gray-700">Admin Email Address</label>
              <input type="email" name="adminEmail" value={(settings as any).adminEmail || ''} onChange={handleChange} className="border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] w-full max-w-md focus:border-[#5e3fde] outline-none" placeholder="orders@yourdomain.com" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-[#5e3fde] text-white rounded-[3px] text-[13px] font-medium hover:bg-[#4b32b2] disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save changes
        </button>
      </div>
    </div>
  );
}
