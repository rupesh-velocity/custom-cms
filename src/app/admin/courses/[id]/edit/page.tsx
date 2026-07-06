'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ClassicEditor from '@/components/ClassicEditor';
import ClassicSidebar from '@/components/ClassicSidebar';
import SeoAnalyzer from '@/components/SeoAnalyzer';
import toast from 'react-hot-toast';

export default function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = use(params);

  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [contentText, setContentText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('Draft');
  const [visibility, setVisibility] = useState('Public');
  const [password, setPassword] = useState('');
  const [publishDate, setPublishDate] = useState('');
  
  const [seoScore, setSeoScore] = useState(0);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast.error('Course not found');
          router.push('/admin/courses');
          return;
        }
        setTitle(data.title || '');
        setSlug(data.slug || '');
        setContentHtml(data.contentHtml || '');
        setContentText(data.contentText || '');
        setVideoUrl(data.videoUrl || '');
        setMetaDescription(data.metaDescription || '');
        setFocusKeyword(data.focusKeyword || '');
        setStatus(data.status || 'Draft');
        setFeaturedImage(data.featuredImage || null);
        if (data.createdAt) {
          const d = new Date(data.createdAt);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          setPublishDate(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
        }
        setIsLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load course');
        setIsLoading(false);
      });
  }, [id, router]);

  const handlePublish = async (overrideStatus?: string) => {
    if (!title) {
      toast.error('Please enter a title');
      return;
    }
    
    setIsSaving(true);
    const finalStatus = overrideStatus || status;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          contentHtml,
          contentText,
          videoUrl,
          metaDescription,
          focusKeyword,
          status: finalStatus,
          featuredImage,
          createdAt: publishDate ? publishDate : undefined,
        }),
      });
      if (res.ok) {
        toast.success('Course updated');
        router.refresh();
      } else {
        toast.error('Failed to update course.');
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex gap-4 max-w-[1200px] mx-auto pt-4">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <ClassicEditor 
          title={title}
          setTitle={setTitle}
          slug={slug}
          setSlug={setSlug}
          contentHtml={contentHtml}
          setContentHtml={setContentHtml}
          setContentText={setContentText}
        />
        
        <div className="bg-white border border-[#c3c4c7] mt-4">
          <div className="px-4 py-3 border-b border-[#c3c4c7] font-semibold text-[#1d2327]">
            Course Video
          </div>
          <div className="p-4">
            <label className="block text-[13px] font-semibold text-[#2c3338] mb-1">Video Embed URL</label>
            <input 
              type="text" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/embed/..."
              className="w-full border border-[#8c8f94] px-3 py-1.5 rounded-[3px] text-[13px] focus:outline-none focus:border-[#5e3fde]"
            />
            <p className="text-[12px] text-gray-500 mt-1">Enter the embed URL for the course video.</p>
          </div>
        </div>
        
        <div className="mt-4">
          <SeoAnalyzer 
            title={title}
            setTitle={setTitle}
            slug={slug}
            setSlug={setSlug}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            content={contentText}
            focusKeyword={focusKeyword}
            setFocusKeyword={setFocusKeyword}
            onScoreChange={setSeoScore}
          />
        </div>
      </div>

      <div className="w-[280px] shrink-0">
        <ClassicSidebar 
          status={status}
          setStatus={setStatus}
          visibility={visibility}
          setVisibility={setVisibility}
          password={password}
          setPassword={setPassword}
          publishDate={publishDate}
          setPublishDate={setPublishDate}
          isNew={false}
          onPublish={handlePublish}
          isSaving={isSaving}
          score={seoScore}
          featuredImage={featuredImage}
          setFeaturedImage={setFeaturedImage}
          isPost={false}
        />
      </div>
    </div>
  );
}
