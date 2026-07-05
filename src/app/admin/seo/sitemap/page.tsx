'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SitemapSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [origin, setOrigin] = useState('');

  const [settings, setSettings] = useState<Record<string, string>>({
    seo_sitemap_links_per_page: '200',
    seo_sitemap_images: 'true',
    seo_sitemap_include_posts: 'true',
    seo_sitemap_include_pages: 'true',
  });

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch('/api/settings/seo')
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load settings', err);
        toast.error('Failed to load settings');
        setIsLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleBoolean = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: prev[key] === 'true' ? 'false' : 'true' }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Sitemap Settings saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sitemap Settings</h1>
          <p className="text-gray-500 mt-2">Configure how XML sitemaps are generated</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium">
            Your sitemap index can be found here: <a href="/sitemap_index.xml" target="_blank" className="underline">{origin}/sitemap_index.xml</a>
          </p>
        </div>

        <div className="space-y-2 border-b border-gray-100 pb-8">
          <label className="block text-sm font-semibold text-gray-900">Links Per Sitemap</label>
          <input
            type="number"
            value={settings.seo_sitemap_links_per_page}
            onChange={(e) => handleChange('seo_sitemap_links_per_page', e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <p className="text-gray-500 text-sm">Max number of links on each sitemap page.</p>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Images in Sitemaps</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">
              Include reference to images from the post content in sitemaps. This helps search engines index the important images on your pages.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            onClick={() => toggleBoolean('seo_sitemap_images')}
            className={`${
              settings.seo_sitemap_images === 'true' ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
          >
            <span className={`${
              settings.seo_sitemap_images === 'true' ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">
              <a href="/post-sitemap.xml" target="_blank" className="text-blue-600 hover:underline block mb-2">{origin}/post-sitemap.xml</a>
              Include Posts in Sitemap
            </p>
          </div>
          <button
            type="button"
            role="switch"
            onClick={() => toggleBoolean('seo_sitemap_include_posts')}
            className={`${
              settings.seo_sitemap_include_posts === 'true' ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-2`}
          >
            <span className={`${
              settings.seo_sitemap_include_posts === 'true' ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pages</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">
              <a href="/page-sitemap.xml" target="_blank" className="text-blue-600 hover:underline block mb-2">{origin}/page-sitemap.xml</a>
              Include Pages in Sitemap
            </p>
          </div>
          <button
            type="button"
            role="switch"
            onClick={() => toggleBoolean('seo_sitemap_include_pages')}
            className={`${
              settings.seo_sitemap_include_pages === 'true' ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-2`}
          >
            <span className={`${
              settings.seo_sitemap_include_pages === 'true' ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
          </button>
        </div>

      </div>
    </div>
  );
}
