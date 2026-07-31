import { prisma } from '@/lib/prisma';

export default async function LocalSeoSchema() {
  let settings: any[] = [];
  
  try {
    settings = await prisma.setting.findMany({
      where: {
        OR: [
          { key: { startsWith: 'seo_local_' } },
          { key: { in: ['seo_social_fb_url', 'seo_social_twitter_username'] } }
        ]
      }
    });
  } catch (error) {
    console.warn("Could not fetch local SEO settings during build (Prisma skipped)");
    return null;
  }
  
  const settingsObj = settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  if (!settingsObj.seo_local_type) {
    return null; // Local SEO not configured
  }

  // Parse JSON fields safely
  const parseJson = (val: string, fallback: any) => {
    try {
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const address = parseJson(settingsObj.seo_local_address, null);
  const openingHours = parseJson(settingsObj.seo_local_opening_hours, []);
  const phones = parseJson(settingsObj.seo_local_phones, []);
  const additionalInfo = parseJson(settingsObj.seo_local_additional_info, []);

  // Build the schema object
  const schema: any = {
    "@context": "https://schema.org",
    "@type": settingsObj.seo_local_type === 'person' ? "Person" : (settingsObj.seo_local_business_type || "Organization"),
    "@id": `${settingsObj.seo_local_url || 'http://localhost:3000'}#organization`,
    "name": settingsObj.seo_local_org_name || settingsObj.seo_local_website_name,
    "url": settingsObj.seo_local_url,
  };

  if (settingsObj.seo_local_website_alt_name) {
    schema.alternateName = settingsObj.seo_local_website_alt_name;
  }

  if (settingsObj.seo_local_logo) {
    schema.logo = {
      "@type": "ImageObject",
      "url": settingsObj.seo_local_logo
    };
    schema.image = schema.logo.url;
  }

  if (settingsObj.seo_local_email) {
    schema.email = settingsObj.seo_local_email;
  }

  if (settingsObj.seo_local_price_range) {
    schema.priceRange = settingsObj.seo_local_price_range;
  }

  if (address && (address.streetAddress || address.addressLocality || address.addressCountry)) {
    schema.address = {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress || undefined,
      "addressLocality": address.addressLocality || undefined,
      "addressRegion": address.addressRegion || undefined,
      "postalCode": address.postalCode || undefined,
      "addressCountry": address.addressCountry || undefined,
    };
  }

  if (settingsObj.seo_local_geo_coords) {
    const parts = settingsObj.seo_local_geo_coords.split(',');
    if (parts.length === 2) {
      schema.geo = {
        "@type": "GeoCoordinates",
        "latitude": parts[0].trim(),
        "longitude": parts[1].trim()
      };
    }
  }

  if (phones && phones.length > 0) {
    schema.contactPoint = phones.map((p: any) => ({
      "@type": "ContactPoint",
      "telephone": p.number,
      "contactType": p.type || "Customer Service"
    }));
  }

  if (openingHours && openingHours.length > 0) {
    schema.openingHoursSpecification = openingHours.map((h: any) => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": h.day,
      "opens": h.timeStart,
      "closes": h.timeEnd
    }));
  }

  const sameAsUrls: string[] = [];

  if (settingsObj.seo_social_fb_url) {
    sameAsUrls.push(settingsObj.seo_social_fb_url);
  }

  if (settingsObj.seo_social_twitter_username) {
    const tw = settingsObj.seo_social_twitter_username;
    if (tw.startsWith('http')) {
      sameAsUrls.push(tw);
    } else {
      sameAsUrls.push(`https://twitter.com/${tw.replace('@', '')}`);
    }
  }

  if (additionalInfo && additionalInfo.length > 0) {
    const additionalSameAs = additionalInfo
      .filter((info: any) => info.key.toLowerCase() === 'sameas')
      .map((info: any) => info.value);
    
    sameAsUrls.push(...additionalSameAs);
  }

  if (sameAsUrls.length > 0) {
    // deduplicate just in case
    schema.sameAs = Array.from(new Set(sameAsUrls));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
