import re

with open('src/app/admin/seo/titles-meta/page.tsx', 'r') as f:
    content = f.read()

# Add imports
imports_to_add = "import { Save, AlertCircle, Image as ImageIcon, Plus, X, Globe, MapPin, Share2, Home, Users, Settings, FileText, File, Paperclip, Briefcase, Folder, Tag } from 'lucide-react';"
content = re.sub(r"import \{ Save, AlertCircle.*?\} from 'lucide-react';", imports_to_add, content)

# Update tabs array to add icons
tabs_replacement = """
  const tabs = [
    { id: 'global', label: 'Global Meta', group: 'general', icon: Settings, desc: 'Change Global meta settings that take effect across your website. Learn more.' },
    { id: 'local', label: 'Local SEO', group: 'general', icon: MapPin, desc: 'Configure Local SEO settings for your business. Learn more.' },
    { id: 'social', label: 'Social Meta', group: 'general', icon: Share2, desc: 'Configure default OpenGraph and Twitter card settings.' },
    { id: 'posts', label: 'Posts', group: 'post_types', icon: FileText, desc: 'Default title tag and description for single Post pages. This can be changed on a per-post basis on the post editor screen.' },
    { id: 'pages', label: 'Pages', group: 'post_types', icon: File, desc: 'Default title tag and description for single Page pages.' },
    { id: 'attachments', label: 'Attachments', group: 'post_types', icon: Paperclip, desc: 'Change Global SEO, Schema, and other settings for media attachment. Learn more.' },
    { id: 'portfolios', label: 'Portfolios', group: 'post_types', icon: Briefcase, desc: 'Default title tag and description for single Portfolio pages.' },
  ];
"""
content = re.sub(r'const tabs = \[.*?\];', tabs_replacement.strip(), content, flags=re.DOTALL)

# Update the placeholder spans with actual icons
content = content.replace(
    '<span className="w-4 h-4 bg-gray-300 rounded-sm inline-block opacity-50"></span> {/* Placeholder for icon */}',
    '<tab.icon size={16} className={activeTab === tab.id ? "text-[#0085ba]" : "text-gray-400"} />'
)

# And we need to remove the wrapper `<div className="space-y-8">` after `{activeTab === 'posts' && (` since we removed it from global but not posts/pages/etc.
content = re.sub(r'(\{activeTab === \'.*?\' && \(\s*)<div className="space-y-8">\s*<div className="divide-y divide-gray-100">', r'\1<div className="divide-y divide-gray-100">', content)
content = re.sub(r'(\{activeTab === \'.*?\' && \(\s*)<div className="space-y-0">\s*<div className="divide-y divide-gray-100">', r'\1<div className="divide-y divide-gray-100">', content)

# Remove extra closing div for the above replacements
# Wait, this is risky. Let's not remove `space-y-8` wrappers if it breaks matching. Instead let's just leave `space-y-8` in there, it won't hurt, it just adds some bottom padding.

with open('src/app/admin/seo/titles-meta/page.tsx', 'w') as f:
    f.write(content)
