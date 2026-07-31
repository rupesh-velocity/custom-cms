'use client';

import { useState, useEffect } from 'react';
import { Save, Settings, Image as ImageIcon, FileText, File, List, Users, Paperclip, Briefcase, Folder, Tag, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SitemapSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [origin, setOrigin] = useState('');
  const [initialSettings, setInitialSettings] = useState<Record<string, string>>({});

  const [settings, setSettings] = useState<Record<string, string>>({
    seo_sitemap_links_per_page: '200',
    seo_sitemap_images: 'true',
    seo_sitemap_include_featured_images: 'false',
    seo_sitemap_exclude_posts: '',
    seo_sitemap_exclude_terms: '',
    seo_sitemap_include_posts: 'true',
    seo_sitemap_include_pages: 'true',
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      setActiveTab(window.location.hash.replace('#', ''));
    }
    setOrigin(window.location.origin);
    fetch('/api/settings/seo')
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
        setInitialSettings((prev) => ({ ...prev, ...data }));
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
      const changedSettings: Record<string, string> = {};
      Object.keys(settings).forEach(key => {
        if (settings[key] !== initialSettings[key]) {
          changedSettings[key] = settings[key];
        }
      });

      if (Object.keys(changedSettings).length === 0) {
        toast.success('Sitemap Settings saved successfully');
        setIsSaving(false);
        return;
      }

      const res = await fetch('/api/settings/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changedSettings)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to save');
      }
      
      setInitialSettings((prev) => ({ ...prev, ...changedSettings }));
      toast.success('Sitemap Settings saved successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  const tabs = [
    { id: 'general', label: 'General', group: 'general', icon: Settings, desc: 'This tab contains General settings related to the XML sitemaps. Learn more.' },
    { id: 'html_sitemap', label: 'HTML Sitemap', group: 'general', icon: List, desc: 'HTML Sitemap Settings.' },
    { id: 'authors', label: 'Authors', group: 'general', icon: Users, desc: 'Author Sitemap Settings.' },
    { id: 'posts', label: 'Posts', group: 'post_types', icon: FileText, desc: 'Configure sitemap settings for posts.' },
    { id: 'pages', label: 'Pages', group: 'post_types', icon: File, desc: 'Configure sitemap settings for pages.' },
    { id: 'attachments', label: 'Attachments', group: 'post_types', icon: Paperclip, desc: 'Configure sitemap settings for attachments.' },
    { id: 'portfolios', label: 'Portfolios', group: 'post_types', icon: Briefcase, desc: 'Configure sitemap settings for portfolios.' },
    { id: 'categories', label: 'Categories', group: 'taxonomies', icon: Folder, desc: 'Configure sitemap settings for categories.' },
    { id: 'tags', label: 'Tags', group: 'taxonomies', icon: Tag, desc: 'Configure sitemap settings for tags.' },
    { id: 'local_sitemap', label: 'Local Sitemap', group: 'taxonomies', icon: MapPin, desc: 'Local Sitemap Settings.' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tabId}`);
    }
  };

  const activeTabInfo = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-4 font-semibold">
        Dashboard / SEO Sitemap
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col min-h-[700px]">
        {/* Full-width Tab Header */}
        <div className="text-center py-10 border-b border-gray-200 bg-white z-10">
          <h2 className="text-[28px] font-medium text-gray-800">{activeTabInfo.label}</h2>
          <p className="text-[13px] text-gray-500 mt-2">{activeTabInfo.desc}</p>
        </div>

        {/* Split Body */}
        <div className="flex flex-1">
          {/* Vertical Tabs Sidebar */}
          <div className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="space-y-0 pb-4">
              {tabs.filter(t => t.group === 'general').map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-3 text-[13px] transition-colors border-b border-gray-200 relative flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-white text-[#0085ba] border-l-4 border-l-[#0085ba] font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-l-transparent'
                  }`}
                  style={activeTab === tab.id ? { width: 'calc(100% + 1px)', borderRight: '1px solid white', zIndex: 10 } : {}}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? "text-[#0085ba]" : "text-gray-400"} />
                  {tab.label}
                </button>
              ))}

              <div className="bg-[#f1f3f5] px-4 py-2 text-[12px] text-gray-600 border-b border-gray-200 shadow-inner mt-4 font-semibold">Post Types:</div>
              
              {tabs.filter(t => t.group === 'post_types').map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-3 text-[13px] transition-colors border-b border-gray-200 relative flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-white text-[#0085ba] border-l-4 border-l-[#0085ba] font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-l-transparent'
                  }`}
                  style={activeTab === tab.id ? { width: 'calc(100% + 1px)', borderRight: '1px solid white', zIndex: 10 } : {}}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? "text-[#0085ba]" : "text-gray-400"} />
                  {tab.label}
                </button>
              ))}

              <div className="bg-[#f1f3f5] px-4 py-2 text-[12px] text-gray-600 border-b border-gray-200 shadow-inner mt-4 font-semibold">Taxonomies:</div>
              
              {tabs.filter(t => t.group === 'taxonomies').map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-3 text-[13px] transition-colors border-b border-gray-200 relative flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-white text-[#0085ba] border-l-4 border-l-[#0085ba] font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-l-transparent'
                  }`}
                  style={activeTab === tab.id ? { width: 'calc(100% + 1px)', borderRight: '1px solid white', zIndex: 10 } : {}}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? "text-[#0085ba]" : "text-gray-400"} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-white relative flex flex-col">
            <div className="flex-1 p-8 pb-24 overflow-y-auto">
              
              {activeTab === 'general' && (
                <div className="divide-y divide-gray-100">
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200 mx-6 mb-6">
                    <p className="text-sm font-medium">
                      Your sitemap index can be found here: <a href="/sitemap_index.xml" target="_blank" className="underline">{origin}/sitemap_index.xml</a>
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                    <div className="col-span-4">
                      <label className="text-[14px] font-bold text-gray-700">Links Per Sitemap</label>
                    </div>
                    <div className="col-span-8">
                      <input
                        type="number"
                        value={settings.seo_sitemap_links_per_page}
                        onChange={(e) => handleChange('seo_sitemap_links_per_page', e.target.value)}
                        className="w-full max-w-md border border-gray-300 rounded px-3 py-2 text-[14px] outline-none focus:border-[#5e3fde]"
                      />
                      <p className="text-[12px] text-gray-500 mt-2">Max number of links on each sitemap page.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                    <div className="col-span-4">
                      <label className="text-[14px] font-bold text-gray-700">Images in Sitemaps</label>
                    </div>
                    <div className="col-span-8">
                      <label className="relative inline-block w-[42px] h-[22px] align-middle select-none transition duration-200 ease-in cursor-pointer mb-2">
                        <input type="checkbox" checked={settings.seo_sitemap_images === 'true'} onChange={() => toggleBoolean('seo_sitemap_images')} className="sr-only peer" />
                        <div className="w-full h-full bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#0085ba]"></div>
                      </label>
                      <p className="text-[12px] text-gray-500 mt-1">Include reference to images from the post content in sitemaps. This helps search engines index the important images on your pages.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                    <div className="col-span-4">
                      <label className="text-[14px] font-bold text-gray-700">Include Featured Images</label>
                    </div>
                    <div className="col-span-8">
                      <label className="relative inline-block w-[42px] h-[22px] align-middle select-none transition duration-200 ease-in cursor-pointer mb-2">
                        <input type="checkbox" checked={settings.seo_sitemap_include_featured_images === 'true'} onChange={() => toggleBoolean('seo_sitemap_include_featured_images')} className="sr-only peer" />
                        <div className="w-full h-full bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#0085ba]"></div>
                      </label>
                      <p className="text-[12px] text-gray-500 mt-1">Include the Featured Image too, even if it does not appear directly in the post content.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                    <div className="col-span-4">
                      <label className="text-[14px] font-bold text-gray-700">Exclude Posts</label>
                    </div>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={settings.seo_sitemap_exclude_posts || ''}
                        onChange={(e) => handleChange('seo_sitemap_exclude_posts', e.target.value)}
                        className="w-full max-w-md border border-gray-300 rounded px-3 py-2 text-[14px] outline-none focus:border-[#5e3fde]"
                      />
                      <p className="text-[12px] text-gray-500 mt-2">Enter post IDs of posts you want to exclude from the sitemap, separated by commas. This option applies to all post types including posts, pages, and custom post types.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                    <div className="col-span-4">
                      <label className="text-[14px] font-bold text-gray-700">Exclude Terms</label>
                    </div>
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={settings.seo_sitemap_exclude_terms || ''}
                        onChange={(e) => handleChange('seo_sitemap_exclude_terms', e.target.value)}
                        className="w-full max-w-md border border-gray-300 rounded px-3 py-2 text-[14px] outline-none focus:border-[#5e3fde]"
                      />
                      <p className="text-[12px] text-gray-500 mt-2">Add term IDs, separated by comma. This option is applied for all taxonomies.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="divide-y divide-gray-100">
                  <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                    <div className="col-span-4">
                      <label className="text-[14px] font-bold text-gray-700">Include in Sitemap</label>
                    </div>
                    <div className="col-span-8">
                      <label className="relative inline-block w-[42px] h-[22px] align-middle select-none transition duration-200 ease-in cursor-pointer mb-2">
                        <input type="checkbox" checked={settings.seo_sitemap_include_posts === 'true'} onChange={() => toggleBoolean('seo_sitemap_include_posts')} className="sr-only peer" />
                        <div className="w-full h-full bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#0085ba]"></div>
                      </label>
                      <p className="text-[12px] text-gray-500 mt-1">Include Posts in Sitemap</p>
                      <a href="/post-sitemap.xml" target="_blank" className="text-[12px] text-blue-600 hover:underline mt-1 block">{origin}/post-sitemap.xml</a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pages' && (
                <div className="divide-y divide-gray-100">
                  <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                    <div className="col-span-4">
                      <label className="text-[14px] font-bold text-gray-700">Include in Sitemap</label>
                    </div>
                    <div className="col-span-8">
                      <label className="relative inline-block w-[42px] h-[22px] align-middle select-none transition duration-200 ease-in cursor-pointer mb-2">
                        <input type="checkbox" checked={settings.seo_sitemap_include_pages === 'true'} onChange={() => toggleBoolean('seo_sitemap_include_pages')} className="sr-only peer" />
                        <div className="w-full h-full bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#0085ba]"></div>
                      </label>
                      <p className="text-[12px] text-gray-500 mt-1">Include Pages in Sitemap</p>
                      <a href="/page-sitemap.xml" target="_blank" className="text-[12px] text-blue-600 hover:underline mt-1 block">{origin}/page-sitemap.xml</a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'general' && activeTab !== 'posts' && activeTab !== 'pages' && (
                <div className="p-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 mx-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">{activeTabInfo.label} Settings</h3>
                  <p>These settings are not yet implemented in this demo.</p>
                </div>
              )}

            </div>
            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200 flex justify-between items-center z-10">
              <button className="px-5 py-2 border border-gray-300 text-gray-600 rounded bg-white hover:bg-gray-50 text-[13px] font-medium shadow-sm transition-colors">
                Reset Options
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-[#0085ba] text-white rounded hover:bg-[#0073a1] text-[13px] font-medium shadow-sm transition-colors disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
