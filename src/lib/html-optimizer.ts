export function optimizeHtmlImages(html: string | null): string {
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
      return `<img ${newAttribs} loading="eager" fetchpriority="high">`;
    } else {
      return `<img ${newAttribs} loading="lazy">`;
    }
  });

  // 3. Lazy load iframes (like Vimeo/YouTube)
  let optimized = htmlWithOptimizedImages;
  optimized = optimized.replace(/<iframe([^>]*)>/gi, (match, attribs) => {
    let newAttribs = attribs.replace(/loading="[^"]*"/i, '');
    return `<iframe ${newAttribs} loading="lazy">`;
  });

  return optimized;
}
