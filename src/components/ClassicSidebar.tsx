'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, MapPin, Eye, Calendar, HelpCircle } from 'lucide-react';
import MediaModal from './MediaModal';

interface ClassicSidebarProps {
  status: string;
  setStatus: (val: string) => void;
  onPublish: () => void;
  isSaving: boolean;
  score: number;
  hideTitle?: boolean;
  setHideTitle?: (val: boolean) => void;
  visibility?: string;
  setVisibility?: (val: string) => void;
  publishDate?: string;
  setPublishDate?: (val: string) => void;
  isNew?: boolean;
}

export default function ClassicSidebar({ status, setStatus, onPublish, isSaving, score, hideTitle, setHideTitle, visibility = 'Public', setVisibility, publishDate, setPublishDate, isNew = false }: ClassicSidebarProps) {
  const [expanded, setExpanded] = useState({
    publish: true,
    contentAI: false,
    pageAttributes: false,
    linkSuggestions: false,
    featuredImage: false,
    pageSettings: false
  });
  
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingVisibility, setEditingVisibility] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  const toggleAccordion = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const Accordion = ({ id, title, children, noPadding = false }: { id: keyof typeof expanded, title: string, children: React.ReactNode, noPadding?: boolean }) => (
    <div className="bg-white border border-[#c3c4c7] shadow-sm mb-4">
      <button 
        onClick={() => toggleAccordion(id)}
        className="w-full flex items-center justify-between px-3 py-2 border-b border-transparent bg-white hover:bg-[#f6f7f7] transition-colors"
      >
        <h2 className="text-[14px] font-semibold text-[#1d2327]">{title}</h2>
        <div className="flex gap-1 text-gray-500">
          {expanded[id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      {expanded[id] && (
        <div className={`border-t border-[#c3c4c7] ${noPadding ? '' : 'p-3'}`}>
          {children}
        </div>
      )}
    </div>
  );

  let scoreColor = 'bg-[#ffaba8] text-[#d63638]';
  if (score > 50) scoreColor = 'bg-[#f0b849] text-[#8a6d3b]';
  if (score >= 80) scoreColor = 'bg-[#c6e1c6] text-[#007017]';

  return (
    <div className="w-full max-w-[280px] font-sans">
      <Accordion id="publish" title="Publish" noPadding>
        <div className="p-3 bg-white">
          <div className="flex justify-end mb-4">
            <button className="bg-[#f3f5f6] border border-[#0071a1] text-[#0071a1] px-3 py-1 rounded-[3px] text-[13px] hover:bg-[#f1f1f1]">
              Preview Changes
            </button>
          </div>
          
          <div className="space-y-3 text-[13px] text-[#50575e] mb-4">
            {/* Status */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> 
                <span>Status: <span className="font-semibold text-[#1d2327]">{status}</span></span>
                {!editingStatus && <button onClick={() => setEditingStatus(true)} className="text-[#0071a1] hover:underline ml-1">Edit</button>}
              </div>
              {editingStatus && (
                <div className="flex items-center gap-2 mt-1">
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="border border-[#8c8f94] rounded-[3px] px-2 py-1 outline-none text-[13px]"
                  >
                    <option value="Published">Published</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Draft">Draft</option>
                  </select>
                  <button onClick={() => setEditingStatus(false)} className="bg-[#f3f5f6] border border-[#8c8f94] px-2 py-1 rounded-[3px]">OK</button>
                  <button onClick={() => setEditingStatus(false)} className="text-[#0071a1] hover:underline">Cancel</button>
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" /> 
                <span>Visibility: <span className="font-semibold text-[#1d2327]">{visibility}</span></span>
                {!editingVisibility && setVisibility && <button onClick={() => setEditingVisibility(true)} className="text-[#0071a1] hover:underline ml-1">Edit</button>}
              </div>
              {editingVisibility && setVisibility && (
                <div className="flex flex-col gap-1 mt-1">
                  <label className="flex items-center gap-2"><input type="radio" name="vis" checked={visibility === 'Public'} onChange={() => setVisibility('Public')} /> Public</label>
                  <label className="flex items-center gap-2"><input type="radio" name="vis" checked={visibility === 'Password Protected'} onChange={() => setVisibility('Password Protected')} /> Password Protected</label>
                  <label className="flex items-center gap-2"><input type="radio" name="vis" checked={visibility === 'Private'} onChange={() => setVisibility('Private')} /> Private</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => setEditingVisibility(false)} className="bg-[#f3f5f6] border border-[#8c8f94] px-2 py-1 rounded-[3px]">OK</button>
                    <button onClick={() => setEditingVisibility(false)} className="text-[#0071a1] hover:underline">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Publish Date */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" /> 
                <span>Published on: <span className="font-semibold text-[#1d2327]">{publishDate ? new Date(publishDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Immediately'}</span></span>
                {!editingDate && setPublishDate && <button onClick={() => setEditingDate(true)} className="text-[#0071a1] hover:underline ml-1">Edit</button>}
              </div>
              {editingDate && setPublishDate && (
                <div className="flex flex-col gap-2 mt-1">
                  <input 
                    type="datetime-local" 
                    value={publishDate ? new Date(new Date(publishDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
                    onChange={(e) => setPublishDate(new Date(e.target.value).toISOString())}
                    className="border border-[#8c8f94] rounded-[3px] px-2 py-1 outline-none text-[13px] w-full"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => setEditingDate(false)} className="bg-[#f3f5f6] border border-[#8c8f94] px-2 py-1 rounded-[3px]">OK</button>
                    <button onClick={() => {
                       setPublishDate(''); // Reset to immediately
                       setEditingDate(false);
                    }} className="text-[#0071a1] hover:underline">Cancel</button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

        <div className={`px-4 py-2 flex items-center gap-2 border-y border-[#c3c4c7] font-semibold text-[13px] ${scoreColor}`}>
           <TrendingUp className="w-4 h-4" /> SEO: {score} / 100
        </div>

        <div className="p-3 bg-[#f6f7f7] flex items-center justify-between rounded-b-[3px]">
           <button className="text-[#b32d2e] text-[13px] hover:underline">Move to Trash</button>
           <button 
             onClick={onPublish}
             disabled={isSaving}
             className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-semibold hover:bg-[#135e96] disabled:opacity-50"
           >
             {isSaving ? 'Updating...' : (isNew ? 'Publish' : 'Update')}
           </button>
        </div>
      </Accordion>

      <Accordion id="pageAttributes" title="Page Attributes">
        <div className="text-[13px] text-[#1d2327]">
           <label className="block font-semibold mb-1">Parent</label>
           <select className="w-full border border-[#8c8f94] rounded-[3px] px-2 py-1 outline-none mb-3">
             <option>(no parent)</option>
           </select>
           
           <label className="block font-semibold mb-1">Order</label>
           <input type="number" defaultValue="0" className="w-full border border-[#8c8f94] rounded-[3px] px-2 py-1 outline-none" />
        </div>
      </Accordion>

      <Accordion id="featuredImage" title="Featured image">
        {featuredImage ? (
          <div className="text-center">
            <img src={featuredImage} alt="Featured" className="w-full h-auto mb-2 rounded border border-gray-200" />
            <div className="flex gap-2 justify-center">
               <button onClick={() => setIsMediaModalOpen(true)} className="text-[#0071a1] text-[13px] hover:underline">Replace</button>
               <button onClick={() => setFeaturedImage(null)} className="text-[#b32d2e] text-[13px] hover:underline">Remove</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsMediaModalOpen(true)} className="text-[#0071a1] text-[13px] hover:underline">Set featured image</button>
        )}
        <MediaModal 
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          onInsert={(url) => setFeaturedImage(url)}
        />
      </Accordion>

      <Accordion id="pageSettings" title="Page Settings">
        <div className="text-[13px] text-[#1d2327]">
           {setHideTitle !== undefined && (
             <label className="flex items-center gap-2 cursor-pointer">
               <input 
                 type="checkbox" 
                 checked={hideTitle} 
                 onChange={(e) => setHideTitle(e.target.checked)}
                 className="w-4 h-4 border-[#8c8f94] rounded-[2px]"
               />
               <span>Hide Page Title on Frontend</span>
             </label>
           )}
        </div>
      </Accordion>
    </div>
  );
}

// Temporary icon since TrendingUp wasn't imported at top
function TrendingUp(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}
