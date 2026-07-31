import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { resolveSeoVariables } from '@/lib/seo-variables';

export interface PageSeoContext {
  title?: string | null;
  description?: string | null; // Raw description (could be %excerpt%)
  url?: string;
  image?: string | null;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean; // Page specific override
  
  // Provide raw data to resolve variables
  rawTitle?: string | null;
  rawContentText?: string | null;
  authorName?: string;
  authorId?: string;
  category?: string;
  postId?: string;
  postDate?: string;
  modifiedDate?: string;
  isPost?: boolean;
}

export async function generateFullMetadata(context: PageSeoContext): Promise<Metadata> {
  let settingsRecords: any[] = [];
  try {
    settingsRecords = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'site_title', 'site_tagline', 'site_icon', 'site_url',
            'seo_separator', 'seo_capitalize_titles', 
            'seo_page_title', 'seo_post_title',
            'seo_global_robots', 'seo_global_advanced_robots',
            'seo_page_robots', 'seo_page_advanced_robots',
            'seo_post_robots', 'seo_post_advanced_robots',
            'seo_og_thumbnail', 'seo_twitter_card',
            'seo_social_fb_url', 'seo_social_twitter_username',
            'seo_google_verify', 'seo_bing_verify', 'seo_baidu_verify', 
            'seo_yandex_verify', 'seo_pinterest_verify',
            'seo_page_slack_enhanced', 'seo_post_slack_enhanced'
          ]
        }
      }
    });
  } catch (error) {
    console.warn("Could not fetch global SEO settings during build.");
  }

  const settings = settingsRecords.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  const siteName = settings.site_title || 'Custom CMS';
  const siteUrl = settings.site_url || 'http://localhost:3000';
  const capitalizeTitles = settings.seo_capitalize_titles === 'true';

  // Construct context for variable replacement
  const varContext = {
    title: context.rawTitle || context.title || '',
    siteName,
    separator: settings.seo_separator || '-',
    excerpt: context.description || context.rawContentText?.substring(0, 160) || settings.site_tagline || '',
    siteDesc: settings.site_tagline || '',
    authorName: context.authorName || '',
    authorId: context.authorId || '',
    category: context.category || '',
    postId: context.postId || '',
    postDate: context.postDate || '',
    modifiedDate: context.modifiedDate || '',
    capitalizeTitles,
  };

  // Determine Title format
  let titleFormat = context.title || '%title% %sep% %sitename%';
  if (!context.title) {
    if (context.isPost && settings.seo_post_title) {
      titleFormat = settings.seo_post_title;
    } else if (!context.isPost && settings.seo_page_title) {
      titleFormat = settings.seo_page_title;
    }
  }

  const finalTitle = resolveSeoVariables(titleFormat, varContext);
  
  const rawDescription = resolveSeoVariables(context.description || '%excerpt%', varContext) || varContext.excerpt;
  const finalDescription = rawDescription?.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim() || '';

  // Images
  const ogImage = context.image || settings.seo_og_thumbnail;
  
  // Robots
  let isNoIndex = context.noIndex || false;
  let isNoFollow = false;
  let isNoArchive = false;
  let isNoImageIndex = false;
  let isNoSnippet = false;

  let robotsSetting = settings.seo_global_robots || 'index';
  let advancedRobotsSetting = settings.seo_global_advanced_robots;

  if (context.isPost && settings.seo_post_robots && settings.seo_post_robots !== 'default') {
    robotsSetting = settings.seo_post_robots;
    advancedRobotsSetting = settings.seo_post_advanced_robots || advancedRobotsSetting;
  } else if (!context.isPost && settings.seo_page_robots && settings.seo_page_robots !== 'default') {
    robotsSetting = settings.seo_page_robots;
    advancedRobotsSetting = settings.seo_page_advanced_robots || advancedRobotsSetting;
  }

  const robotTokens = robotsSetting.split(',').map((s: string) => s.toLowerCase().replace(/\s+/g, ''));
  if (robotTokens.includes('noindex')) isNoIndex = true;
  if (robotTokens.includes('nofollow')) isNoFollow = true;
  if (robotTokens.includes('noarchive')) isNoArchive = true;
  if (robotTokens.includes('noimageindex')) isNoImageIndex = true;
  if (robotTokens.includes('nosnippet')) isNoSnippet = true;

  const robots: any = {
    index: !isNoIndex,
    follow: !isNoFollow,
    nocache: isNoArchive,
    noimageindex: isNoImageIndex,
    nosnippet: isNoSnippet,
  };

  if (advancedRobotsSetting) {
    // format: snippet:-1,video:-1,image:large
    const advParts = advancedRobotsSetting.split(',');
    advParts.forEach((part: string) => {
      const [k, v] = part.split(':').map((s: string) => s.trim());
      if (k === 'snippet' && v === '-1') robots.maxSnippet = -1;
      if (k === 'video' && v === '-1') robots.maxVideoPreview = -1;
      if (k === 'image' && v === 'large') robots.maxImagePreview = 'large';
    });
  }

  const metadata: Metadata & { other?: any } = {
    metadataBase: new URL(siteUrl),
    title: finalTitle,
    description: finalDescription,
    robots,
    alternates: context.url ? {
      canonical: context.url,
    } : undefined,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: context.url || siteUrl,
      siteName: siteName,
      type: context.type || 'website',
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: (settings.seo_twitter_card as any) || 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      site: settings.seo_social_twitter_username || undefined,
      images: ogImage ? [ogImage] : [],
    },
    icons: settings.site_icon ? [
      { rel: 'icon', url: settings.site_icon },
      { rel: 'apple-touch-icon', url: settings.site_icon },
    ] : undefined,
    verification: {
      google: settings.seo_google_verify,
      yahoo: settings.seo_bing_verify,
      yandex: settings.seo_yandex_verify,
      other: {
        'msvalidate.01': settings.seo_bing_verify,
        'baidu-site-verification': settings.seo_baidu_verify,
        'p:domain_verify': settings.seo_pinterest_verify,
      },
    }
  };

  const slackEnhanced = context.isPost ? settings.seo_post_slack_enhanced === 'true' : settings.seo_page_slack_enhanced === 'true';
  if (slackEnhanced && context.rawContentText) {
    const wordCount = context.rawContentText.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    metadata.other = {
      ...(metadata.other || {}),
      'twitter:label1': 'Est. reading time',
      'twitter:data1': `${readingTime} minute${readingTime > 1 ? 's' : ''}`
    };
  }

  return metadata;
}
