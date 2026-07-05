'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Media {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  altText: string | null;
  createdAt: string;
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (error) {
      toast.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          toast.success(`${file.name} uploaded`);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        toast.error(`Error uploading ${file.name}`);
      }
    }
    
    setIsUploading(false);
    fetchMedia();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Media deleted');
        if (selectedMedia?.id === id) setSelectedMedia(null);
        fetchMedia();
      } else {
        toast.error('Failed to delete media');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altText: selectedMedia.altText,
          filename: selectedMedia.filename
        })
      });
      
      if (res.ok) {
        toast.success('Saved');
        fetchMedia();
      } else {
        toast.error('Failed to save');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
    setIsUpdating(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-light text-[#1d2327]">Media Library</h1>
        <div className="relative">
          <input 
            type="file" 
            multiple 
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={isUploading}
          />
          <button 
            disabled={isUploading}
            className="bg-white border border-[#5e3fde] text-[#5e3fde] px-4 py-1.5 rounded-[3px] text-[13px] font-semibold hover:bg-[#f6f7f7] disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Add New'}
          </button>
        </div>
      </div>

      <div 
        className={`w-full border-2 border-dashed rounded-lg p-12 text-center mb-8 transition-colors ${dragActive ? 'border-[#5e3fde] bg-[#f0f6fc]' : 'border-[#c3c4c7] bg-white'}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={(e) => { 
          e.preventDefault(); 
          setDragActive(false);
          handleUpload(e.dataTransfer.files);
        }}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Drop files here</h3>
        <p className="text-gray-500 mb-4">or</p>
        <div className="relative inline-block">
          <input 
            type="file" 
            multiple 
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={isUploading}
          />
          <button className="bg-white border border-[#5e3fde] text-[#5e3fde] px-4 py-1.5 rounded-[3px] text-[13px] font-semibold hover:bg-[#f6f7f7] disabled:opacity-50">
            Select Files
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-[#c3c4c7] bg-white rounded-[3px]">
          No media files found. Upload some files to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {media.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedMedia(item)}
              className="relative group bg-white border border-[#c3c4c7] rounded-[3px] aspect-square flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#5e3fde] transition-colors"
            >
              {item.mimeType.startsWith('image/') ? (
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-[11px] text-gray-500 text-center break-all line-clamp-2">{item.filename}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Attachment Details Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-8 font-sans">
          <div className="bg-white w-full max-w-5xl h-full max-h-[700px] flex rounded-md shadow-xl overflow-hidden relative">
            <button 
              onClick={() => setSelectedMedia(null)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 z-10 bg-white rounded-full p-1 shadow"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            {/* Left side: Image Preview */}
            <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-hidden border-r border-gray-200">
              {selectedMedia.mimeType.startsWith('image/') ? (
                <img src={selectedMedia.url} alt={selectedMedia.filename} className="max-w-full max-h-full object-contain shadow-sm" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-24 h-24 text-gray-400 mb-4" />
                  <span className="text-gray-500">{selectedMedia.filename}</span>
                </div>
              )}
            </div>
            
            {/* Right side: Details and Edit Form */}
            <div className="w-80 bg-gray-50 p-6 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-4 text-[13px] uppercase">Attachment Details</h3>
              <div className="space-y-4 text-[13px] mb-8">
                <div>
                  <div className="font-semibold text-gray-900 truncate">{selectedMedia.filename}</div>
                  <div className="text-gray-500">{new Date(selectedMedia.createdAt).toLocaleDateString()}</div>
                  <div className="text-gray-500">{formatBytes(selectedMedia.size)}</div>
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={() => handleDelete(selectedMedia.id)}
                    className="text-[#d63638] hover:underline"
                  >
                    Delete permanently
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-4 text-[13px] border-t border-gray-200 pt-6">
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Alternative Text</label>
                  <textarea 
                    value={selectedMedia.altText || ''}
                    onChange={(e) => setSelectedMedia({...selectedMedia, altText: e.target.value})}
                    className="w-full border border-[#8c8f94] rounded-[3px] px-2 py-1.5 focus:border-[#5e3fde] focus:ring-1 focus:ring-[#5e3fde] outline-none"
                    rows={3}
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Describe the purpose of the image. Leave empty if the image is purely decorative.</p>
                </div>
                
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Title</label>
                  <input 
                    type="text" 
                    value={selectedMedia.filename}
                    onChange={(e) => setSelectedMedia({...selectedMedia, filename: e.target.value})}
                    className="w-full border border-[#8c8f94] rounded-[3px] px-2 py-1.5 focus:border-[#5e3fde] focus:ring-1 focus:ring-[#5e3fde] outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">File URL</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedMedia.url} 
                    className="w-full border border-[#8c8f94] bg-gray-100 rounded-[3px] px-2 py-1.5 text-gray-500"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const fullUrl = new URL(selectedMedia.url, window.location.origin).toString();
                      navigator.clipboard.writeText(fullUrl);
                      toast.success('URL copied to clipboard');
                    }}
                    className="mt-2 text-[#5e3fde] hover:underline"
                  >
                    Copy URL to clipboard
                  </button>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="bg-[#5e3fde] text-white px-4 py-1.5 rounded-[3px] font-semibold hover:bg-[#4b32b2] disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
