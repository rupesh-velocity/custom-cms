'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClassicEditor from '@/components/ClassicEditor';
import ClassicSidebar from '@/components/ClassicSidebar';
import SeoAnalyzer from '@/components/SeoAnalyzer';
import toast from 'react-hot-toast';

export default function NewPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('<p>Start writing your page here...</p>');
  const [contentText, setContentText] = useState('Start writing your page here...');
  const [heroDescription, setHeroDescription] = useState('');
  
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [redirectType, setRedirectType] = useState('301');
  const [noIndex, setNoIndex] = useState(false);
  const [schemaJson, setSchemaJson] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('Draft');
  const [visibility, setVisibility] = useState('Public');
  const [password, setPassword] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [hideTitle, setHideTitle] = useState(false);
  
  const [seoScore, setSeoScore] = useState(0);
  
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  const handlePublish = async (overrideStatus?: string) => {
    if (!title) {
      toast.error('Please enter a title');
      return;
    }
    
    setIsSaving(true);
    const finalStatus = overrideStatus || status;
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          contentHtml,
          contentText,
          metaDescription,
          focusKeyword,
          redirectUrl,
          redirectType,
          noIndex,
          status: finalStatus,
          visibility,
          password,
          publishedAt: publishDate ? publishDate : undefined,
          hideTitle,
          schemaJson,
          seoScore,
          featuredImage,
          heroDescription
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/pages/${data.id}`);
        router.refresh();
      } else {
        toast.error('Failed to save page.');
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

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
          heroDescription={heroDescription}
          setHeroDescription={setHeroDescription}
        />
        
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
          isNew={true}
          onPublish={handlePublish}
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
  );
}
