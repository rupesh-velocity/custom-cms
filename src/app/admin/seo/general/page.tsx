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
    seo_image_alt_format: '%title% %count(title)%',
    seo_image_title_format: '%title% %count(title)%',
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
    breadcrumbs_enabled: 'false',
    breadcrumbs_separator: '-',
    breadcrumbs_show_home: 'true',
    breadcrumbs_home_label: 'Home',
    breadcrumbs_home_link: '/',
    breadcrumbs_prefix: '',
    breadcrumbs_hide_title: 'false',
    llms_txt_enabled: 'true',
    llms_txt_post_types_posts: 'true',
    llms_txt_post_types_pages: 'true',
    llms_txt_post_types_products: 'false',
    llms_txt_post_types_courses: 'false',
    llms_txt_taxonomies_categories: 'false',
    llms_txt_limit: '50',
    llms_txt_additional_content: '',
    md_endpoints_enabled: 'true',
    md_endpoints_posts: 'true',
    md_endpoints_pages: 'true',
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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to save: ${errorData.details || res.statusText}`);
      }
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
    { id: 'breadcrumbs', label: 'Breadcrumbs' },
    { id: 'llms', label: 'Edit llms.txt' },
    { id: 'md', label: 'MD Endpoints' },
    { id: 'webmaster', label: 'Webmaster Tools' },
    { id: 'robots', label: 'Edit robots.txt' },
  ];
  
  const separators = ['-', '–', '—', '»', '|', '•', '/'];

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

              {settings.seo_add_missing_alt === 'true' && (
                <div className="pl-6 border-l-2 border-gray-200 ml-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Alt attribute format</label>
                  <input
                    type="text"
                    value={settings.seo_image_alt_format}
                    onChange={(e) => handleChange('seo_image_alt_format', e.target.value)}
                    placeholder="%title% %count(title)%"
                    className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500">
                    Format used for the new <code className="bg-gray-100 px-1 py-0.5 rounded">alt</code> attribute values.
                    Available variables: <code className="bg-gray-100 px-1 py-0.5 rounded">%title%</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">%count(title)%</code>
                  </p>
                </div>
              )}


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

              {settings.seo_add_missing_title === 'true' && (
                <div className="pl-6 border-l-2 border-gray-200 ml-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Title attribute format</label>
                  <input
                    type="text"
                    value={settings.seo_image_title_format}
                    onChange={(e) => handleChange('seo_image_title_format', e.target.value)}
                    placeholder="%title% %count(title)%"
                    className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500">
                    Format used for the new <code className="bg-gray-100 px-1 py-0.5 rounded">title</code> attribute values.
                    Available variables: <code className="bg-gray-100 px-1 py-0.5 rounded">%title%</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">%count(title)%</code>
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'breadcrumbs' && (
            <div className="space-y-8">
              {/* Instructions Banner */}
              <div className="bg-[#fff9e6] border-l-4 border-[#f0c33c] py-3 px-4 rounded-r-md text-[13px] text-gray-700">
                <div className="mb-2">
                  Use the following code in your theme template files or editor to display breadcrumbs.
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className="bg-[#f0f0f1] px-1.5 py-0.5 rounded border border-gray-200">import Breadcrumbs from '@/components/Breadcrumbs';</span>
                  <span className="text-[#555] font-sans font-medium text-xs">THEN</span>
                  <span className="bg-[#f0f0f1] px-1.5 py-0.5 rounded border border-gray-200">&lt;Breadcrumbs /&gt;</span>
                  <span className="text-[#555] font-sans font-medium text-xs ml-1 mr-1">OR</span>
                  <span className="bg-[#f0f0f1] px-1.5 py-0.5 rounded border border-gray-200">[breadcrumbs]</span>
                </div>
              </div>
              
              {/* Enable breadcrumbs function */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Enable breadcrumbs function</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">Enable to turn on breadcrumbs for the site and make the [breadcrumbs] shortcode available.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.breadcrumbs_enabled === 'true'}
                  onClick={() => toggleBoolean('breadcrumbs_enabled')}
                  className={`${
                    settings.breadcrumbs_enabled === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span className={`${
                    settings.breadcrumbs_enabled === 'true' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>

              {/* Separator Character */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 pt-2">Separator Character</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">Separator character or string that appears between breadcrumb items.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {separators.map(sep => (
                    <button
                      key={sep}
                      type="button"
                      onClick={() => handleChange('breadcrumbs_separator', sep)}
                      className={`w-10 h-10 flex items-center justify-center border rounded font-medium ${settings.breadcrumbs_separator === sep ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {sep}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Homepage Link */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Show Homepage Link</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">Display homepage breadcrumb in trail.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => toggleBoolean('breadcrumbs_show_home')}
                  className={`${
                    settings.breadcrumbs_show_home === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span className={`${
                    settings.breadcrumbs_show_home === 'true' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>

              {/* Homepage label */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 pt-2">Homepage label</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">Label used for homepage link (first item) in breadcrumbs.</p>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    value={settings.breadcrumbs_home_label}
                    onChange={(e) => handleChange('breadcrumbs_home_label', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Homepage Link */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 pt-2">Homepage Link</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">Link to use for homepage (first item) in breadcrumbs. Leave as / for relative site root.</p>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    value={settings.breadcrumbs_home_link}
                    onChange={(e) => handleChange('breadcrumbs_home_link', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Prefix Breadcrumb */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 pt-2">Prefix Breadcrumb</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">Prefix for the breadcrumb path (e.g. "You are here: ").</p>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    value={settings.breadcrumbs_prefix}
                    onChange={(e) => handleChange('breadcrumbs_prefix', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Hide Post Title */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hide Post Title</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">Hide Post title from Breadcrumb.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => toggleBoolean('breadcrumbs_hide_title')}
                  className={`${
                    settings.breadcrumbs_hide_title === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span className={`${
                    settings.breadcrumbs_hide_title === 'true' ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>

            </div>
          )}

          {activeTab === 'llms' && (
            <div className="space-y-8">
              <div className="bg-[#f0f6fc] border border-[#c8e1ff] text-[#333] p-4 rounded mb-6 text-sm">
                Your llms.txt file is available at: <a href="/llms.txt" target="_blank" className="text-blue-600 hover:underline font-medium ml-1">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/llms.txt
                </a>
              </div>

              {/* Select Post Types */}
              <div className="flex items-start gap-12 border-b border-gray-100 pb-8">
                <div className="w-1/3">
                  <h3 className="text-sm font-semibold text-gray-900">Select Post Types</h3>
                </div>
                <div className="w-2/3">
                  <button type="button" className="border border-gray-300 text-gray-600 text-sm px-4 py-1.5 rounded mb-4 hover:bg-gray-50">Select / Deselect All</button>
                  <div className="grid grid-cols-2 gap-y-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="llms_txt_post_types_posts" checked={settings.llms_txt_post_types_posts === 'true'} onChange={(e) => handleChange('llms_txt_post_types_posts', e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                      Posts
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="llms_txt_post_types_pages" checked={settings.llms_txt_post_types_pages === 'true'} onChange={(e) => handleChange('llms_txt_post_types_pages', e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                      Pages
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="llms_txt_post_types_products" checked={settings.llms_txt_post_types_products === 'true'} onChange={(e) => handleChange('llms_txt_post_types_products', e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                      Products
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="llms_txt_post_types_courses" checked={settings.llms_txt_post_types_courses === 'true'} onChange={(e) => handleChange('llms_txt_post_types_courses', e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                      Courses
                    </label>
                  </div>
                  <p className="text-gray-500 text-xs mt-4">Select the post types to be included in the llms.txt file.</p>
                </div>
              </div>

              {/* Select Taxonomies */}
              <div className="flex items-start gap-12 border-b border-gray-100 pb-8">
                <div className="w-1/3">
                  <h3 className="text-sm font-semibold text-gray-900">Select Taxonomies</h3>
                </div>
                <div className="w-2/3">
                  <button type="button" className="border border-gray-300 text-gray-600 text-sm px-4 py-1.5 rounded mb-4 hover:bg-gray-50">Select / Deselect All</button>
                  <div className="grid grid-cols-2 gap-y-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="llms_txt_taxonomies_categories" checked={settings.llms_txt_taxonomies_categories === 'true'} onChange={(e) => handleChange('llms_txt_taxonomies_categories', e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                      Categories
                    </label>
                  </div>
                  <p className="text-gray-500 text-xs mt-4">Select the taxonomies to be included in the llms.txt file.</p>
                </div>
              </div>

              {/* Posts/Terms Limit */}
              <div className="flex items-start gap-12 border-b border-gray-100 pb-8">
                <div className="w-1/3">
                  <h3 className="text-sm font-semibold text-gray-900 pt-2">Posts/Terms Limit</h3>
                </div>
                <div className="w-2/3">
                  <input
                    type="number"
                    name="llms_txt_limit"
                    value={settings.llms_txt_limit}
                    onChange={(e) => handleChange('llms_txt_limit', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-2">Maximum number of links to include for each post type.</p>
                </div>
              </div>

              {/* Additional Content */}
              <div className="flex items-start gap-12">
                <div className="w-1/3">
                  <h3 className="text-sm font-semibold text-gray-900 pt-2">Additional Content</h3>
                </div>
                <div className="w-2/3">
                  <textarea
                    rows={6}
                    name="llms_txt_additional_content"
                    value={settings.llms_txt_additional_content}
                    onChange={(e) => handleChange('llms_txt_additional_content', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'md' && (
            <div className="space-y-8">
              {/* MD Endpoints Settings */}
              <div className="flex items-start gap-12 border-b border-gray-100 pb-8">
                <div className="w-1/3">
                  <h3 className="text-sm font-semibold text-gray-900">Markdown (.md) Endpoints</h3>
                  <p className="text-gray-500 text-xs mt-1">Allow AI agents to fetch the raw text of pages by appending .md to the URL.</p>
                </div>
                <div className="w-2/3">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                      <input type="checkbox" name="md_endpoints_enabled" checked={settings.md_endpoints_enabled === 'true'} onChange={(e) => handleChange('md_endpoints_enabled', e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                      Enable .md Endpoints Global Feature
                    </label>
                    <div className="pl-6 space-y-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" name="md_endpoints_pages" checked={settings.md_endpoints_pages === 'true'} onChange={(e) => handleChange('md_endpoints_pages', e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-blue-600 rounded border-gray-300" disabled={settings.md_endpoints_enabled !== 'true'} />
                        Allow for Pages
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" name="md_endpoints_posts" checked={settings.md_endpoints_posts === 'true'} onChange={(e) => handleChange('md_endpoints_posts', e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-blue-600 rounded border-gray-300" disabled={settings.md_endpoints_enabled !== 'true'} />
                        Allow for Posts
                      </label>
                    </div>
                  </div>
                </div>
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



        </div>
      </div>
    </div>
  );
}
