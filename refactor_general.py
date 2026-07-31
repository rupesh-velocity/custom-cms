import re

with open('src/app/admin/seo/general/page.tsx', 'r') as f:
    content = f.read()

# Add imports
imports_to_add = "import { Save, AlertCircle, Image as ImageIcon, Link as LinkIcon, Settings, Globe, FileText, Code } from 'lucide-react';"
content = re.sub(r"import \{ Save, AlertCircle, Image as ImageIcon, Plus, X \} from 'lucide-react';", imports_to_add, content)
content = re.sub(r"import \{ Save, AlertCircle.*?\} from 'lucide-react';", imports_to_add, content)

# Update tabs array
tabs_replacement = """
  const tabs = [
    { id: 'links', label: 'Links', group: 'general', icon: LinkIcon, desc: 'Configure site-wide behavior for external links.' },
    { id: 'images', label: 'Images', group: 'general', icon: ImageIcon, desc: 'Automate image alt and title attributes.' },
    { id: 'breadcrumbs', label: 'Breadcrumbs', group: 'general', icon: Globe, desc: 'Enable and configure site-wide breadcrumbs.' },
    { id: 'llms', label: 'Edit llms.txt', group: 'advanced', icon: FileText, desc: 'Configure how LLMs read your content.' },
    { id: 'md', label: 'MD Endpoints', group: 'advanced', icon: Code, desc: 'Allow AI agents to fetch raw markdown.' },
    { id: 'webmaster', label: 'Webmaster Tools', group: 'advanced', icon: Settings, desc: 'Enter verification codes for third-party webmaster tools.' },
    { id: 'robots', label: 'Edit robots.txt', group: 'advanced', icon: FileText, desc: 'Control what search engine bots see.' },
  ];
"""
content = re.sub(r'const tabs = \[.*?\];', tabs_replacement.strip(), content, flags=re.DOTALL)

# Add activeTabInfo
content = content.replace(
    "  return (",
    "  const activeTabInfo = tabs.find(t => t.id === activeTab) || tabs[0];\n\n  return ("
)

# Update the outer layout
outer_start_regex = r'<div className="max-w-6xl mx-auto space-y-6 p-8">.*?<div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden min-h-\[600px\]">'
new_outer_start = """
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-4 font-semibold">
        Dashboard / General SEO Settings
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
              <div className="bg-[#f1f3f5] px-4 py-2 text-[12px] text-gray-600 border-b border-gray-200 shadow-inner font-semibold mb-2">General</div>
              {tabs.filter(t => t.group === 'general').map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

              <div className="bg-[#f1f3f5] px-4 py-2 text-[12px] text-gray-600 border-y border-gray-200 shadow-inner mt-4 mb-2 font-semibold">Advanced</div>
              {tabs.filter(t => t.group === 'advanced').map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
"""
content = re.sub(outer_start_regex, new_outer_start.strip(), content, flags=re.DOTALL)

# Remove the internal tab headers and wrappers that we added earlier
content = re.sub(r'<div className="space-y-[08]">\s*<div className="text-center.*?</p>\s*</div>\s*<div className="bg-white rounded border border-gray-200 shadow-sm divide-y divide-gray-100">', '<div className="divide-y divide-gray-100">', content, flags=re.DOTALL)
content = re.sub(r'<div className="text-center.*?</p>\s*</div>', '', content, flags=re.DOTALL)
content = content.replace('<div className="bg-white rounded border border-gray-200 shadow-sm divide-y divide-gray-100">', '<div className="divide-y divide-gray-100">')

# Add the footer
footer_replacement = """
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
"""
content = re.sub(r'          </div>\s*</div>\s*</div>\s*\);\s*}\s*$', footer_replacement + "\n}", content, flags=re.DOTALL)
# One issue: earlier I added `</div></div>` for some closures which I didn't remove. 
# But it's easier to just remove one extra </div> when doing footer replacement if needed.
# Since I replaced the wrapper with `<div className="divide-y divide-gray-100">`, the closure count remains the same!

with open('src/app/admin/seo/general/page.tsx', 'w') as f:
    f.write(content)
