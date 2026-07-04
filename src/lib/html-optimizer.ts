export function optimizeHtmlImages(html: string | null, seoSettings?: Record<string, string>): string {
  if (!html) return '';
  
  let isFirstImage = true;
  
  let htmlWithOptimizedImages = html.replace(/<img([^>]*)>/gi, (match, attribs) => {
    let newAttribs = attribs;
    
    // 1. Optimize Cloudinary URLs (f_auto,q_auto)
    newAttribs = newAttribs.replace(
      /src="https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(v[0-9]+\/[^"]+)"/i,
      'src="https://res.cloudinary.com/$1/image/upload/f_auto,q_auto/$2"'
    );
    
    // 2. Fix LCP priority
    newAttribs = newAttribs.replace(/loading="[^"]*"/i, '');
    newAttribs = newAttribs.replace(/fetchpriority="[^"]*"/i, '');
    
    if (isFirstImage) {
      isFirstImage = false;
      newAttribs += ' loading="eager" fetchpriority="high"';
    } else {
      newAttribs += ' loading="lazy"';
    }

    // SEO: Add missing ALT
    if (seoSettings?.seo_add_missing_alt === 'true' && !/alt=/i.test(newAttribs)) {
      newAttribs += ' alt="Image"'; // Generic fallback if missing
    }

    // SEO: Add missing TITLE
    if (seoSettings?.seo_add_missing_title === 'true' && !/title=/i.test(newAttribs)) {
      newAttribs += ' title="Image"';
    }

    return `<img ${newAttribs}>`;
  });

  let optimized = htmlWithOptimizedImages;

  // SEO: Optimize Links
  if (seoSettings) {
    optimized = optimized.replace(/<a([^>]*)>/gi, (match, attribs) => {
      let newAttribs = attribs;
      
      const isExternal = /href="https?:\/\//i.test(newAttribs) && !newAttribs.includes(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      const isImageFile = /href="[^"]+\.(jpg|jpeg|png|gif|webp|svg)"/i.test(newAttribs);

      if (isExternal && seoSettings.seo_nofollow_external === 'true' && !/rel=/i.test(newAttribs)) {
        newAttribs += ' rel="nofollow"';
      }

      if (isImageFile && seoSettings.seo_nofollow_image === 'true' && !/rel=/i.test(newAttribs)) {
        newAttribs += ' rel="nofollow"';
      }

      if (isExternal && seoSettings.seo_open_external_new_tab === 'true' && !/target=/i.test(newAttribs)) {
        newAttribs += ' target="_blank"';
      }

      return `<a ${newAttribs}>`;
    });
  }

  // 3. Lazy load iframes (like Vimeo/YouTube)
  optimized = optimized.replace(/<iframe([^>]*)>/gi, (match, attribs) => {
    let newAttribs = attribs.replace(/loading="[^"]*"/i, '');
    return `<iframe ${newAttribs} loading="lazy">`;
  });

  return optimized;
}
