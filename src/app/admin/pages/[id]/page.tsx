'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ClassicEditor from '@/components/ClassicEditor';
import ClassicSidebar from '@/components/ClassicSidebar';
import SeoAnalyzer from '@/components/SeoAnalyzer';
import toast from 'react-hot-toast';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [contentText, setContentText] = useState('');
  
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('Draft');
  const [visibility, setVisibility] = useState('Public');
  const [password, setPassword] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [hideTitle, setHideTitle] = useState(false);
  
  const [seoTitle, setSeoTitle] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [redirectType, setRedirectType] = useState('301');
  const [noIndex, setNoIndex] = useState(false);
  const [schemaJson, setSchemaJson] = useState('');
  
  const [seoScore, setSeoScore] = useState(0);
  const [isHomepage, setIsHomepage] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    
    fetch(`/api/pages/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast.error('Page not found');
          router.push('/admin/pages');
          return;
        }
        setTitle(data.title || '');
        setSlug(data.slug || '');
        setContentHtml(data.contentHtml || '');
        setContentText(data.contentText || '');
        setMetaDescription(data.metaDescription || '');
        setFocusKeyword(data.focusKeyword || '');
        setStatus(data.status || 'Draft');
        setVisibility(data.visibility || 'Public');
        setPassword(data.password || '');
        setPublishDate(data.publishedAt || data.createdAt || '');
        setHideTitle(data.hideTitle || false);
        setSeoTitle(data.seoTitle || '');
        setRedirectUrl(data.redirectUrl || '');
        setRedirectType(data.redirectType || '301');
        setNoIndex(data.noIndex || false);
        setSchemaJson(data.schemaJson || '');
        setSeoScore(data.seoScore || 0);
        setFeaturedImage(data.featuredImage || null);
        
        // Check if this is the homepage
        fetch('/api/settings')
          .then(res => res.json())
          .then(settings => {
            if (settings.homepage_displays === 'static_page' && settings.homepage_page_id === params.id) {
              setIsHomepage(true);
            }
            setIsLoading(false);
          })
          .catch(() => setIsLoading(false));
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [params.id, router]);

  const handleUpdate = async (overrideStatus?: string) => {
    if (!title) {
      toast.error('Please enter a title');
      return;
    }
    
    setIsSaving(true);
    const finalStatus = overrideStatus || status;
    try {
      const res = await fetch(`/api/pages/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          contentHtml,
          contentText,
          metaDescription,
          focusKeyword,
          seoTitle,
          redirectUrl,
          redirectType,
          noIndex,
          status: finalStatus,
          visibility,
          password,
          publishedAt: publishDate,
          hideTitle,
          schemaJson,
          seoScore,
          featuredImage
        }),
      });
      if (res.ok) {
        // Just refresh the data, don't navigate away
        toast.success('Page updated successfully!');
        router.refresh();
      } else {
        toast.error('Failed to update page.');
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto pt-4">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-[23px] text-[#1d2327]">Edit Page</h1>
        <Link href="/admin/pages/new" className="border border-[#5e3fde] text-[#5e3fde] hover:bg-[#f6f7f7] px-2.5 py-0.5 text-[13px] rounded-[3px] font-medium transition-colors">
          Add Page
        </Link>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
        <ClassicEditor 
          title={title}
          setTitle={setTitle}
          slug={slug}
          setSlug={setSlug}
          contentHtml={contentHtml}
          setContentHtml={setContentHtml}
          setContentText={setContentText}
          isHomepage={isHomepage}
        />
        
        <div className="mt-4">
          <SeoAnalyzer 
            title={title}
            setTitle={setTitle}
            slug={slug}
            setSlug={setSlug}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            content={contentHtml}
            focusKeyword={focusKeyword}
            setFocusKeyword={setFocusKeyword}
            seoTitle={seoTitle}
            setSeoTitle={setSeoTitle}
            redirectUrl={redirectUrl}
            setRedirectUrl={setRedirectUrl}
            redirectType={redirectType}
            setRedirectType={setRedirectType}
            noIndex={noIndex}
            setNoIndex={setNoIndex}
            schemaJson={schemaJson}
            setSchemaJson={setSchemaJson}
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
          onPublish={handleUpdate}
          isSaving={isSaving}
          score={seoScore}
          hideTitle={hideTitle}
          setHideTitle={setHideTitle}
          featuredImage={featuredImage}
          setFeaturedImage={setFeaturedImage}
          isPost={false}
        />
      </div>
    </div>
    </div>
  );
}
