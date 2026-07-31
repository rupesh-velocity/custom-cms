const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/seo/titles-meta/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const postBulkEditingBlock = `<div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Custom Fields</label>
                  </div>
                  <div className="col-span-8">
                    <input type="text" value={settings.seo_post_custom_fields || ''} onChange={(e) => handleChange('seo_post_custom_fields', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] outline-none focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba]" />
                    <p className="text-[13px] text-gray-500 mt-2">List of custom fields to include in the Page Analysis. Add multiple fields by separating them with a comma.</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">`;

const pageBulkEditingBlock = `<div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Custom Fields</label>
                  </div>
                  <div className="col-span-8">
                    <input type="text" value={settings.seo_page_custom_fields || ''} onChange={(e) => handleChange('seo_page_custom_fields', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] outline-none focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba]" />
                    <p className="text-[13px] text-gray-500 mt-2">List of custom fields to include in the Page Analysis. Add multiple fields by separating them with a comma.</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">`;

// For Posts:
const postTarget = `<div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Bulk Editing</label>`;

// Wait, looking at the previous output, the Posts bulk editing doesn't have border-b. It says:
// <div className="grid grid-cols-12 gap-8 py-6 px-6">
// <div className="col-span-4">
// <label className="text-[14px] font-bold text-gray-700">Bulk Editing</label>

const postTargetActual = `<div className="grid grid-cols-12 gap-8 py-6 px-6">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Bulk Editing</label>`;

const postReplacement = `<div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Custom Fields</label>
                  </div>
                  <div className="col-span-8">
                    <input type="text" value={settings.seo_post_custom_fields || ''} onChange={(e) => handleChange('seo_post_custom_fields', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] outline-none focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba]" />
                    <p className="text-[13px] text-gray-500 mt-2">List of custom fields to include in the Page Analysis. Add multiple fields by separating them with a comma.</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 py-6 px-6">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Bulk Editing</label>`;


content = content.replace(postTargetActual, postReplacement);

// Now for Pages:
// Previous output for Pages:
// <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
// <div className="col-span-4">
// <label className="text-[14px] font-bold text-gray-700">Bulk Editing</label>

const pageTargetActual = `<div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Bulk Editing</label>`;

const pageReplacement = `<div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Custom Fields</label>
                  </div>
                  <div className="col-span-8">
                    <input type="text" value={settings.seo_page_custom_fields || ''} onChange={(e) => handleChange('seo_page_custom_fields', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] outline-none focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba]" />
                    <p className="text-[13px] text-gray-500 mt-2">List of custom fields to include in the Page Analysis. Add multiple fields by separating them with a comma.</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 py-6 px-6 border-b border-gray-100">
                  <div className="col-span-4">
                    <label className="text-[14px] font-bold text-gray-700">Bulk Editing</label>`;

content = content.replace(pageTargetActual, pageReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('UI injected.');
