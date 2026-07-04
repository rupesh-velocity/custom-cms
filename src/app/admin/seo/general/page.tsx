'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeoGeneralSettings() {
  const [activeTab, setActiveTab] = useState('links');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<Record<string, string>>({
    seo_nofollow_external: 'false',
    seo_nofollow_image: 'false',
    seo_open_external_new_tab: 'false',
    seo_add_missing_alt: 'false',
    seo_add_missing_title: 'false',
    seo_google_verify: '',
    seo_bing_verify: '',
    seo_baidu_verify: '',
    seo_yandex_verify: '',
    seo_pinterest_verify: '',
    seo_norton_verify: '',
    seo_custom_webmaster_tags: '',
    seo_robots_txt: '',
    seo_sitemap_links_per_page: '200',
    seo_sitemap_images: 'true',
    seo_sitemap_featured_images: 'false',
    seo_sitemap_include_posts: 'true',
    seo_html_sitemap_include_posts: 'true',
    seo_sitemap_include_pages: 'true',
    seo_html_sitemap_include_pages: 'true',
  });

  useEffect(() => {
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
      toast.success('SEO Settings saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'links', label: 'Links' },
    { id: 'images', label: 'Images' },
    { id: 'webmaster', label: 'Webmaster Tools' },
    { id: 'robots', label: 'Edit robots.txt' },
    { id: 'sitemap', label: 'Sitemap Settings' },
  ];

  if (isLoading) {
    return <div className="p-8 flex justify-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">General SEO Settings</h1>
          <p className="text-gray-500 mt-2">Configure site-wide SEO settings</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600 border-l-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'links' && (
            <div className="space-y-8">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nofollow External Links</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xl">
                    Automatically add rel="nofollow" attribute for external links appearing in your posts, pages, and other post types. The attribute is dynamically applied when the content is displayed, and the stored content is not changed.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.seo_nofollow_external === 'true'}
                  onClick={() => toggleBoolean('seo_nofollow_external')}
                  className={`${
                    settings.seo_nofollow_external === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span className={`${
                    settings.seo_nofollow_external === 'true' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nofollow Image File Links</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xl">
                    Automatically add rel="nofollow" attribute for links pointing to external image files. The attribute is dynamically applied when the content is displayed, and the stored content is not changed.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => toggleBoolean('seo_nofollow_image')}
                  className={`${
                    settings.seo_nofollow_image === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                >
                  <span className={`${
                    settings.seo_nofollow_image === 'true' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Open External Links in New Tab/Window</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xl">
                    Automatically add target="_blank" attribute for external links appearing in your posts, pages, and other post types to make them open in a new browser tab or window. The attribute is dynamically applied when the content is displayed.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => toggleBoolean('seo_open_external_new_tab')}
                  className={`${
                    settings.seo_open_external_new_tab === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                >
                  <span className={`${
                    settings.seo_open_external_new_tab === 'true' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-8">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add missing ALT attributes</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xl">
                    Add alt attributes for images without alt attributes automatically. The attribute is dynamically applied when the content is displayed, and the stored content is not changed.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => toggleBoolean('seo_add_missing_alt')}
                  className={`${
                    settings.seo_add_missing_alt === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                >
                  <span className={`${
                    settings.seo_add_missing_alt === 'true' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add missing TITLE attributes</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xl">
                    Add TITLE attribute for all images without a TITLE attribute automatically. The attribute is dynamically applied when the content is displayed, and the stored content is not changed.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => toggleBoolean('seo_add_missing_title')}
                  className={`${
                    settings.seo_add_missing_title === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                >
                  <span className={`${
                    settings.seo_add_missing_title === 'true' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'webmaster' && (
            <div className="space-y-6">
              <p className="text-gray-500 mb-6">Enter verification codes for third-party webmaster tools.</p>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Google Search Console</label>
                <input
                  type="text"
                  value={settings.seo_google_verify}
                  onChange={(e) => handleChange('seo_google_verify', e.target.value)}
                  placeholder="Enter your Google Search Console verification HTML code or ID"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Bing Webmaster Tools</label>
                <input
                  type="text"
                  value={settings.seo_bing_verify}
                  onChange={(e) => handleChange('seo_bing_verify', e.target.value)}
                  placeholder="Enter your Bing Webmaster Tools verification HTML code or ID"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Baidu Webmaster Tools</label>
                <input
                  type="text"
                  value={settings.seo_baidu_verify}
                  onChange={(e) => handleChange('seo_baidu_verify', e.target.value)}
                  placeholder="Enter your Baidu Webmaster Tools verification HTML code or ID"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Yandex Verification ID</label>
                <input
                  type="text"
                  value={settings.seo_yandex_verify}
                  onChange={(e) => handleChange('seo_yandex_verify', e.target.value)}
                  placeholder="Enter your Yandex verification HTML code or ID"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Pinterest Verification ID</label>
                <input
                  type="text"
                  value={settings.seo_pinterest_verify}
                  onChange={(e) => handleChange('seo_pinterest_verify', e.target.value)}
                  placeholder="Enter your Pinterest verification HTML code or ID"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Norton Safe Web Verification ID</label>
                <input
                  type="text"
                  value={settings.seo_norton_verify}
                  onChange={(e) => handleChange('seo_norton_verify', e.target.value)}
                  placeholder="Enter your Norton Safe Web verification HTML code or ID"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Custom Webmaster Tags</label>
                <textarea
                  rows={4}
                  value={settings.seo_custom_webmaster_tags}
                  onChange={(e) => handleChange('seo_custom_webmaster_tags', e.target.value)}
                  placeholder="Enter your custom webmaster tags. Only <meta> tags are allowed."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'robots' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex items-start gap-3 border border-yellow-200">
                <AlertCircle size={20} className="mt-0.5" />
                <p className="text-sm">
                  Leave the field empty to let the CMS handle the contents dynamically. Editing this file directly gives you full control over what bots see.
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Edit robots.txt</label>
                <textarea
                  rows={15}
                  value={settings.seo_robots_txt}
                  onChange={(e) => handleChange('seo_robots_txt', e.target.value)}
                  placeholder="User-agent: *&#10;Disallow: /wp-admin/&#10;Allow: /wp-admin/admin-ajax.php"
                  className="w-full border border-gray-300 bg-gray-900 text-gray-100 rounded-lg px-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'sitemap' && (
            <div className="space-y-8">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium">
                  Your sitemap index can be found here: <a href="/sitemap_index.xml" target="_blank" className="underline">/sitemap_index.xml</a>
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
                    <a href="/post-sitemap.xml" target="_blank" className="text-blue-600 hover:underline block mb-2">/post-sitemap.xml</a>
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
                    <a href="/page-sitemap.xml" target="_blank" className="text-blue-600 hover:underline block mb-2">/page-sitemap.xml</a>
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
          )}

        </div>
      </div>
    </div>
  );
}
