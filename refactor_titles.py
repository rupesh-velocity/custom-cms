import re

with open('src/app/admin/seo/titles-meta/page.tsx', 'r') as f:
    content = f.read()

# 1. Update the tabs array to include descriptions
tabs_replacement = """
  const tabs = [
    { id: 'global', label: 'Global Meta', group: 'general', desc: 'Change Global meta settings that take effect across your website. Learn more.' },
    { id: 'local', label: 'Local SEO', group: 'general', desc: 'Configure Local SEO settings for your business. Learn more.' },
    { id: 'social', label: 'Social Meta', group: 'general', desc: 'Configure default OpenGraph and Twitter card settings.' },
    { id: 'posts', label: 'Posts', group: 'post_types', desc: 'Default title tag and description for single Post pages. This can be changed on a per-post basis on the post editor screen.' },
    { id: 'pages', label: 'Pages', group: 'post_types', desc: 'Default title tag and description for single Page pages.' },
    { id: 'attachments', label: 'Attachments', group: 'post_types', desc: 'Change Global SEO, Schema, and other settings for media attachment. Learn more.' },
    { id: 'portfolios', label: 'Portfolios', group: 'post_types', desc: 'Default title tag and description for single Portfolio pages.' },
  ];
"""
content = re.sub(r'const tabs = \[.*?\];', tabs_replacement.strip(), content, flags=re.DOTALL)

# 2. Add activeTabInfo before return
content = content.replace(
    "  if (isLoading) {",
    "  const activeTabInfo = tabs.find(t => t.id === activeTab) || tabs[0];\n\n  if (isLoading) {"
)

# 3. Replace the outer structure and header
outer_start_regex = r'<div className="max-w-6xl mx-auto space-y-6">\s*<div className="flex items-center justify-between">.*?<div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden min-h-\[600px\]">'

new_outer_start = """
    <div className="max-w-6xl mx-auto">
      <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-4 font-semibold">
        Dashboard / SEO Titles & Meta
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
                  <span className="w-4 h-4 bg-gray-300 rounded-sm inline-block opacity-50"></span> {/* Placeholder for icon */}
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
                  <span className="w-4 h-4 bg-gray-300 rounded-sm inline-block opacity-50"></span> {/* Placeholder for icon */}
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

# 4. Remove all individual tab headers (they are now in the global header)
# Examples: 
# <div className="text-center mb-8">\n  <h2 className="text-[20px] font-bold text-gray-900 mb-1">Global Meta</h2>...</div>
# And we also need to get rid of the inner divs wrapping the headers if they exist, or just the header block.
content = re.sub(r'<div className="text-center mb-8">\s*<h2.*?</h2>\s*<p.*?</p>\s*</div>', '', content, flags=re.DOTALL)
# For the cases where there is a space-y-0 wrapper around it:
content = re.sub(r'<div className="space-y-0">\s*<div className="bg-white rounded border border-gray-200 shadow-sm divide-y divide-gray-100">', '<div className="bg-white rounded border border-gray-200 shadow-sm divide-y divide-gray-100">', content, flags=re.DOTALL)
# In titles-meta, there is:
#             <div className="space-y-0">
#               <div className="text-center mb-8">
#                 <h2 className="text-[20px] font-bold text-gray-900 mb-1">Global Meta</h2>
#                 <p className="text-[14px] text-gray-500">...</p>
#               </div>
#               <div className="bg-white rounded border border-gray-200 shadow-sm divide-y divide-gray-100">
# Wait, actually let's just strip the text-center div and manually replace the bg-white wrappers next.

# 5. Remove the border box wrappers. Rank Math just renders the rows directly.
# But wait, our components might rely on the grid-cols-12 styling inside. That's fine.
content = content.replace('<div className="bg-white rounded border border-gray-200 shadow-sm divide-y divide-gray-100">', '<div className="divide-y divide-gray-100">')
content = content.replace('<div className="bg-white rounded border border-gray-200 shadow-sm">', '<div className="divide-y divide-gray-100">')

# 6. Add footer to the content area
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

# The file currently ends with:
#         </div>
#       </div>
#     </div>
#   );
# }

content = re.sub(r'          </div>\s*</div>\s*</div>\s*\);\s*}\s*$', footer_replacement + "\n}", content, flags=re.DOTALL)

with open('src/app/admin/seo/titles-meta/page.tsx', 'w') as f:
    f.write(content)
