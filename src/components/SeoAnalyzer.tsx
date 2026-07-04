'use client';

import { useState, useEffect } from 'react';
import { 
  Cog, Briefcase, FileText, Share2, ChevronDown, ChevronUp, 
  XCircle, CheckCircle2, HelpCircle, TrendingUp, X, Star,
  Book, GraduationCap, Database, Calendar, List, CheckSquare, 
  Film, Music, User, Mic, ShoppingCart, Utensils, UtensilsCrossed, 
  Settings, LayoutGrid, Video, PlusCircle, Info
} from 'lucide-react';

interface SeoAnalyzerProps {
  title: string;
  setTitle: (t: string) => void;
  slug: string;
  setSlug: (s: string) => void;
  metaDescription: string;
  setMetaDescription: (d: string) => void;
  content: string;
  focusKeyword: string;
  setFocusKeyword: (k: string) => void;
  onScoreChange?: (score: number) => void;
}

type FieldType = 'text' | 'textarea' | 'radio' | 'group' | 'info' | 'section';

interface SchemaField {
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  info?: string;
}

const shortcodeInfo = "You can either use this shortcode or Schema Block in the block editor to print the schema data in the content in order to meet the Google's guidelines. Read more about it here.";
const reviewLocationInfo = "Custom (use shortcode)\nThe review or rating must be displayed on the page to comply with Google's Schema guidelines.\n\nShortcode\n[rank_math_rich_snippet]\n" + shortcodeInfo;
const shortcodeOnlyInfo = "Shortcode\n[rank_math_rich_snippet]\n" + shortcodeInfo;

const reviewFields: SchemaField[] = [
  { label: 'Review', type: 'section' },
  { label: 'RATING SCORE', type: 'text' },
  { label: 'RATING MINIMUM', type: 'text', placeholder: '1', info: 'Rating minimum score' },
  { label: 'RATING MAXIMUM', type: 'text', placeholder: '5', info: 'Rating maximum score' }
];

const addressFields: SchemaField[] = [
  { label: 'Address', type: 'section' },
  { label: 'STREET ADDRESS', type: 'text' },
  { label: 'LOCALITY', type: 'text' },
  { label: 'REGION', type: 'text' },
  { label: 'POSTAL CODE', type: 'text' },
  { label: 'COUNTRY', type: 'text' }
];

const schemaFieldDefinitions: Record<string, SchemaField[]> = {
  'Article': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'KEYWORDS *', type: 'text', placeholder: '%keywords%' },
    { label: 'ARTICLE TYPE *', type: 'radio', options: ['Article', 'Blog Post', 'News Article'] }
  ],
  'Book': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'REVIEW LOCATION', type: 'info', info: reviewLocationInfo },
    { label: 'URL *', type: 'text' },
    { label: 'AUTHOR NAME *', type: 'text', placeholder: '%name%' },
    { label: 'REVIEW', type: 'text' },
    ...reviewFields,
    { label: 'EDITIONS', type: 'group' }
  ],
  'Course': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'REVIEW LOCATION', type: 'info', info: reviewLocationInfo },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'Course Provider', type: 'section' },
    { label: 'PROVIDER TYPE', type: 'radio', options: ['Organization', 'Person'] },
    { label: 'COURSE PROVIDER NAME', type: 'text' },
    { label: 'COURSE PROVIDER URL', type: 'text' },
    { label: 'Course Instance', type: 'section' },
    { label: 'COURSE MODE', type: 'radio', options: ['Online'], info: 'The medium through which the course will be delivered.' },
    { label: 'COURSE WORKLOAD', type: 'text', info: 'Total time to watch all videos and complete all assignments and exams for the course. Use the 8601 format. Example: PT22H' },
    { label: 'Course Schedule', type: 'section' },
    { label: 'DURATION', type: 'text', info: 'Suggested pacing in repeatFrequency units (8601 duration format).' },
    { label: 'REPEAT COUNT', type: 'text' },
    { label: 'REPEAT FREQUENCY', type: 'text', placeholder: 'Select Repeat Frequency' },
    { label: 'START DATE', type: 'text', placeholder: 'YYYY-MM-DD' },
    { label: 'END DATE', type: 'text', placeholder: 'YYYY-MM-DD' },
    { label: 'Offers', type: 'section' },
    { label: 'CATEGORY', type: 'text', info: 'The pricing category of the course. Example: Free, Partially Free, Subscription, Paid' },
    { label: 'PRICE', type: 'text' },
    { label: 'CURRENCY', type: 'text' },
    ...reviewFields
  ],
  'Dataset': [
    { label: 'DATASET NAME *', type: 'text' },
    { label: 'DESCRIPTION', type: 'textarea' }
  ],
  'Event': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'REVIEW LOCATION', type: 'info', info: reviewLocationInfo },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'EVENT TYPE', type: 'text', info: 'Type of the event' },
    { label: 'EVENT STATUS', type: 'radio', options: ['Scheduled'], info: 'Current status of the event (optional)' },
    { label: 'EVENT ATTENDANCE MODE', type: 'radio', options: ['Offline'], info: 'Indicates whether the event occurs online, offline at a physical location, or a mix of both.' },
    { label: 'VENUE NAME', type: 'text' },
    { label: 'VENUE URL', type: 'text' },
    ...addressFields,
    { label: 'Performer Information', type: 'section' },
    { label: 'PERFORMER TYPE', type: 'radio', options: ['Organization', 'Person'] },
    { label: 'PERFORMER NAME', type: 'text' },
    { label: 'WEBSITE OR SOCIAL LINK', type: 'text' },
    { label: 'START DATE *', type: 'text', info: 'Date and time of the event' },
    { label: 'END DATE', type: 'text', info: 'End date and time of the event' },
    { label: 'Offers', type: 'section' },
    { label: 'OFFER URL', type: 'text' },
    { label: 'PRICE', type: 'text' },
    { label: 'CURRENCY', type: 'text' },
    { label: 'AVAILABILITY', type: 'radio', options: ['In Stock'], info: 'Offer availability' },
    { label: 'PRICE VALID FROM', type: 'text' },
    { label: 'INVENTORY LEVEL', type: 'text' },
    ...reviewFields
  ],
  'FAQ': [
    { label: 'QUESTIONS', type: 'group' }
  ],
  'Fact Check': [
    { label: 'CLAIM *', type: 'textarea' },
    { label: 'CLAIM AUTHOR', type: 'text' },
    { label: 'FACT CHECK RESULT', type: 'text' }
  ],
  'HowTo': [
    { label: 'NAME *', type: 'text' },
    { label: 'DESCRIPTION', type: 'textarea' },
    { label: 'STEPS', type: 'group' }
  ],
  'Job Posting': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'SHORTCODE', type: 'info', info: shortcodeOnlyInfo },
    { label: 'SALARY CURRENCY', type: 'text', info: 'ISO 4217 Currency code. Example: EUR' },
    { label: 'SALARY (RECOMMENDED)', type: 'text', info: 'Insert amount, e.g. 50.00, or a salary range, e.g. 40.00-50.00' },
    { label: 'PAYROLL (RECOMMENDED)', type: 'radio', options: ['None'] },
    { label: 'DATE POSTED', type: 'text', placeholder: '%date(Y-m-d)%' },
    { label: 'EXPIRY POSTED', type: 'text' },
    { label: 'UNPUBLISH WHEN EXPIRED', type: 'radio', options: ['Yes'] },
    { label: 'EMPLOYMENT TYPE (RECOMMENDED)', type: 'radio', options: ['None', 'Full Time', 'Part Time', 'Contractor', 'Temporary', 'Intern', 'Volunteer', 'Per Diem', 'Other'] },
    { label: 'HIRING ORGANIZATION', type: 'text', placeholder: '%org_name%' },
    { label: 'ORGANIZATION URL (RECOMMENDED)', type: 'text', placeholder: '%org_url%' },
    { label: 'ORGANIZATION LOGO (RECOMMENDED)', type: 'text', placeholder: '%org_logo%' },
    { label: 'POSTING ID (RECOMMENDED)', type: 'text' },
    ...addressFields
  ],
  'Movie': [
    { label: 'MOVIE NAME *', type: 'text' },
    { label: 'DIRECTOR', type: 'text' },
    { label: 'DATE CREATED', type: 'text' }
  ],
  'Music': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'SHORTCODE', type: 'info', info: shortcodeOnlyInfo },
    { label: 'URL', type: 'text', placeholder: '%url%' },
    { label: 'MUSIC TYPE', type: 'radio', options: ['MusicGroup', 'MusicAlbum'] }
  ],
  'Person': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'SHORTCODE', type: 'info', info: shortcodeOnlyInfo },
    { label: 'EMAIL', type: 'text' },
    ...addressFields,
    { label: 'GENDER', type: 'text' },
    { label: 'JOB TITLE', type: 'text' }
  ],
  'Podcast Episode': [
    { label: 'EPISODE NAME *', type: 'text' },
    { label: 'PODCAST NAME', type: 'text' },
    { label: 'URL', type: 'text' }
  ],
  'Product': [
    { label: 'PRODUCT NAME *', type: 'text', placeholder: '%seo_title%' },
    { label: 'REVIEW LOCATION', type: 'info', info: reviewLocationInfo },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'PRODUCT SKU', type: 'text' },
    { label: 'BRAND NAME', type: 'text' },
    { label: 'Offers', type: 'section' },
    { label: 'PRICE', type: 'text' },
    { label: 'CURRENCY', type: 'text' },
    { label: 'AVAILABILITY', type: 'radio', options: ['In Stock'] },
    { label: 'PRICE VALID UNTIL', type: 'text' },
    ...reviewFields
  ],
  'Recipe': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'REVIEW LOCATION', type: 'info', info: reviewLocationInfo },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'PREPARATION TIME', type: 'text', info: 'ISO 8601 duration format. Example: PT1H30M' },
    { label: 'COOKING TIME', type: 'text' },
    { label: 'TOTAL TIME', type: 'text' },
    { label: 'TYPE', type: 'text' },
    { label: 'CUISINE', type: 'text' },
    { label: 'KEYWORDS', type: 'text' },
    { label: 'RECIPE YIELD', type: 'text' },
    { label: 'CALORIES', type: 'text' },
    { label: 'RECIPE INGREDIENTS', type: 'group' },
    ...reviewFields,
    { label: 'Video', type: 'section' },
    { label: 'NAME', type: 'text' },
    { label: 'VIDEO DESCRIPTION', type: 'textarea' },
    { label: 'VIDEO URL', type: 'text' },
    { label: 'CONTENT URL', type: 'text' },
    { label: 'RECIPE VIDEO THUMBNAIL', type: 'text' },
    { label: 'DURATION', type: 'text' },
    { label: 'VIDEO UPLOAD DATE', type: 'text' },
    { label: 'INSTRUCTION TYPE', type: 'radio', options: ['Single Field', 'How To Step'] },
    { label: 'RECIPE INSTRUCTIONS', type: 'textarea' }
  ],
  'Restaurant': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'SHORTCODE', type: 'info', info: shortcodeOnlyInfo },
    { label: 'PHONE NUMBER', type: 'text' },
    { label: 'PRICE RANGE', type: 'text' },
    ...addressFields,
    { label: 'Geo Coordinates', type: 'section' },
    { label: 'LATITUDE', type: 'text' },
    { label: 'LONGITUDE', type: 'text' },
    { label: 'Timings', type: 'section' },
    { label: 'OPEN DAYS', type: 'radio', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    { label: 'OPENING TIME', type: 'text', placeholder: '09:00 AM' },
    { label: 'CLOSING TIME', type: 'text', placeholder: '05:00 PM' },
    { label: 'SERVES CUISINE', type: 'group' },
    { label: 'MENU URL', type: 'text' }
  ],
  'Service': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'SHORTCODE', type: 'info', info: shortcodeOnlyInfo },
    { label: 'SERVICE TYPE', type: 'text', info: "The type of service being offered, e.g. veterans' benefits, emergency relief, etc." },
    { label: 'Offers', type: 'section' },
    { label: 'PRICE', type: 'text' },
    { label: 'CURRENCY', type: 'text' }
  ],
  'Software': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'REVIEW LOCATION', type: 'info', info: reviewLocationInfo },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'OPERATING SYSTEM', type: 'text', info: 'For example, Windows 7, OSX 10.6, Android 1.6' },
    { label: 'APPLICATION CATEGORY', type: 'text', info: 'For example, Game, Multimedia' },
    { label: 'Offers', type: 'section' },
    { label: 'PRICE', type: 'text' },
    { label: 'CURRENCY', type: 'text' },
    ...reviewFields
  ],
  'Video': [
    { label: 'HEADLINE *', type: 'text', placeholder: '%seo_title%' },
    { label: 'DESCRIPTION', type: 'textarea', placeholder: '%seo_description%' },
    { label: 'SHORTCODE', type: 'info', info: shortcodeOnlyInfo },
    { label: 'EMBED URL', type: 'text' },
    { label: 'CONTENT URL', type: 'text' },
    { label: 'DURATION', type: 'text' }
  ]
};

export default function SeoAnalyzer({
  title, setTitle, slug, setSlug, metaDescription, setMetaDescription, content, focusKeyword, setFocusKeyword, onScoreChange
}: SeoAnalyzerProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isSnippetExpanded, setIsSnippetExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const [expanded, setExpanded] = useState({
    basic: true,
    additional: false,
    title: false,
    content: false,
  });

  // Advanced Tab State
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsNoIndex, setRobotsNoIndex] = useState(false);
  const [isRedirect, setIsRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  const handleIndexToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRobotsIndex(isChecked);
    if (isChecked) {
      setRobotsNoIndex(false);
    }
  };
  
  const handleNoIndexToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRobotsNoIndex(isChecked);
    if (isChecked) {
      setRobotsIndex(false);
    }
  };

  // Schema Tab State
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isSchemaBuilderOpen, setIsSchemaBuilderOpen] = useState(false);
  const [schemaModalTab, setSchemaModalTab] = useState('templates');
  const [selectedSchema, setSelectedSchema] = useState('Article');
  const [customSchemaJson, setCustomSchemaJson] = useState('');
  
  const [schemaData, setSchemaData] = useState<Record<string, string>>({
    'Article_HEADLINE *': '%seo_title%',
    'Article_DESCRIPTION': '%seo_description%',
    'Article_KEYWORDS *': '%keywords%',
    'Article_ARTICLE TYPE *': 'Article'
  });

  const handleSchemaDataChange = (fieldLabel: string, value: string) => {
    setSchemaData(prev => ({
      ...prev,
      [`${selectedSchema}_${fieldLabel}`]: value
    }));
  };

  const schemaTypes = [
    { name: 'Article', icon: FileText, pro: false },
    { name: 'Book', icon: Book, pro: false },
    { name: 'Course', icon: GraduationCap, pro: false },
    { name: 'Dataset', icon: Database, pro: true },
    { name: 'Event', icon: Calendar, pro: false },
    { name: 'FAQ', icon: List, pro: true },
    { name: 'Fact Check', icon: CheckSquare, pro: true },
    { name: 'HowTo', icon: HelpCircle, pro: true },
    { name: 'Job Posting', icon: Briefcase, pro: false },
    { name: 'Movie', icon: Film, pro: true },
    { name: 'Music', icon: Music, pro: false },
    { name: 'Person', icon: User, pro: false },
    { name: 'Podcast Episode', icon: Mic, pro: true },
    { name: 'Product', icon: ShoppingCart, pro: false },
    { name: 'Recipe', icon: Utensils, pro: false },
    { name: 'Restaurant', icon: UtensilsCrossed, pro: false },
    { name: 'Service', icon: Settings, pro: false },
    { name: 'Software', icon: LayoutGrid, pro: false },
    { name: 'Video', icon: Video, pro: false }
  ];

  const toggleAccordion = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Keyword array parsing
  const keywordsArray = focusKeyword.split(',').map(k => k.trim()).filter(k => k.length > 0);
  const primaryKeyword = keywordsArray[0] || '';

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim() && keywordsArray.length < 5 && !keywordsArray.includes(inputValue.trim())) {
        setFocusKeyword([...keywordsArray, inputValue.trim()].join(', '));
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && keywordsArray.length > 0) {
      const newArr = [...keywordsArray];
      newArr.pop();
      setFocusKeyword(newArr.join(', '));
    }
  };

  const removeKeyword = (index: number) => {
    const newArr = [...keywordsArray];
    newArr.splice(index, 1);
    setFocusKeyword(newArr.join(', '));
  };

  // SEO Score Logic
  const safeKeyword = primaryKeyword.toLowerCase();
  const safeTitle = title.toLowerCase();
  const safeDesc = metaDescription.toLowerCase();
  const safeContent = content.toLowerCase();
  const safeSlug = slug.toLowerCase();

  const hasKeyword = safeKeyword.length > 0;
  
  const keywordInTitle = hasKeyword && safeTitle.includes(safeKeyword);
  const keywordInDesc = hasKeyword && safeDesc.includes(safeKeyword);
  const normalizedSlug = safeSlug.replace(/[-_]/g, ' ');
  const keywordInSlug = hasKeyword && normalizedSlug.includes(safeKeyword);
  const keywordAtStartContent = hasKeyword && safeContent.substring(0, 150).includes(safeKeyword);
  const keywordInContent = hasKeyword && safeContent.includes(safeKeyword);
  
  const wordCount = content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(w => w.length > 0).length;
  const wordCountGood = wordCount >= 600;

  const basicChecks = [
    { pass: keywordInTitle, text: 'Add Focus Keyword to the SEO title.', passedText: 'Focus Keyword found in the SEO title.' },
    { pass: keywordInDesc, text: 'Add Focus Keyword to your SEO Meta Description.', passedText: 'Focus Keyword found in your SEO Meta Description.' },
    { pass: keywordInSlug, text: 'Use Focus Keyword in the URL.', passedText: 'Focus Keyword used in the URL.' },
    { pass: keywordAtStartContent, text: 'Use Focus Keyword at the beginning of your content.', passedText: 'Focus Keyword appears in the first 10% of the content.' },
    { pass: keywordInContent, text: 'Use Focus Keyword in the content.', passedText: 'Focus Keyword found in the content.' },
    { pass: wordCountGood, text: `Content is ${wordCount} words long. Consider using at least 600 words.`, passedText: `Content is ${wordCount} words long. Good job!` }
  ];
  const basicErrors = basicChecks.filter(c => !c.pass).length;

  const hasH2H3 = /<h[2-3]>[^<]*<\/h[2-3]>/i.test(content);
  const keywordInH2 = hasKeyword && hasH2H3 && safeContent.includes(safeKeyword); 
  const keywordInImageAlt = hasKeyword && safeContent.includes(`alt="`) && safeContent.includes(safeKeyword);
  
  const keywordCount = hasKeyword ? (safeContent.match(new RegExp(safeKeyword, 'g')) || []).length : 0;
  const keywordDensity = wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(1) : "0.0";
  const densityGood = parseFloat(keywordDensity) > 0.5 && parseFloat(keywordDensity) < 2.5;
  
  const urlLengthGood = slug.length > 0 && slug.length <= 75;
  const hasOutboundLinks = /href="http(s)?:\/\/(?!localhost)/i.test(content);
  const hasInternalLinks = /href="(\/|http(s)?:\/\/localhost)/i.test(content);

  const additionalChecks = [
    { pass: keywordInH2, text: 'Use Focus Keyword in subheading(s) like H2, H3, H4, etc..', passedText: 'Focus Keyword found in subheading(s).' },
    { pass: keywordInImageAlt, text: 'Add an image with your Focus Keyword as alt text.', passedText: 'Focus Keyword found in image alt attributes.' },
    { pass: densityGood, text: `Keyword Density is ${keywordDensity}. Aim for around 1% Keyword Density.`, passedText: `Keyword Density is ${keywordDensity}, which is great.` },
    { pass: urlLengthGood, text: `URL is ${slug.length || 0} characters long. Aim for short URLs.`, passedText: `URL is ${slug.length} characters long. Kudos!` },
    { pass: hasOutboundLinks, text: 'No outbound links were found. Link out to external resources.', passedText: 'Great! You are linking to external resources.' },
    { pass: hasInternalLinks, text: 'Add internal links to other resources on your website.', passedText: 'You are linking to other resources on your website which is great.' },
    { pass: hasKeyword, text: 'Set a Focus Keyword for this content.', passedText: 'Focus Keyword is set.' },
    { pass: true, text: '', passedText: 'You are using Content AI to optimise this Page.' } 
  ];
  const additionalErrors = additionalChecks.filter(c => !c.pass).length;

  const keywordNearStartTitle = hasKeyword && safeTitle.indexOf(safeKeyword) < 20 && safeTitle.indexOf(safeKeyword) >= 0;
  const hasSentiment = /amazing|best|worst|great|terrible|awesome/i.test(safeTitle);
  const hasPowerWord = /exclusive|secret|guaranteed|proven/i.test(safeTitle);
  const hasNumberInTitle = /\d/.test(safeTitle);

  const titleChecks = [
    { pass: keywordNearStartTitle, text: 'Use the Focus Keyword near the beginning of SEO title.', passedText: 'Focus Keyword placed near the beginning of SEO title.' },
    { pass: hasSentiment, text: "Your title doesn't contain a positive or a negative sentiment word.", passedText: 'Your title contains a sentiment word.' },
    { pass: hasPowerWord, text: "Your title doesn't contain a power word. Add at least one.", passedText: 'Your title contains at least one power word.' },
    { pass: hasNumberInTitle, text: "Your SEO title doesn't contain a number.", passedText: 'Your SEO title contains a number.' }
  ];
  const titleErrors = titleChecks.filter(c => !c.pass).length;

  const hasToc = false; 
  const hasShortParagraphs = !/(<p>[\s\S]*?<\/p>\s*){5,}/i.test(content); 
  const hasMedia = /<(img|video|iframe)/i.test(content);

  const contentChecks = [
    { pass: hasToc, text: "You don't seem to be using a Table of Contents plugin.", passedText: "You are using a Table of Contents plugin." },
    { pass: hasShortParagraphs, text: "Your paragraphs are too long. Use short paragraphs.", passedText: "You are using short paragraphs." },
    { pass: hasMedia, text: "You are not using rich media like images or videos.", passedText: "You are using rich media." }
  ];
  const contentErrors = contentChecks.filter(c => !c.pass).length;

  const totalChecks = basicChecks.length + additionalChecks.length + titleChecks.length + contentChecks.length;
  const passedChecks = [...basicChecks, ...additionalChecks, ...titleChecks, ...contentChecks].filter(c => c.pass).length;
  // If no focus keyword is set, default the score to 0 to mimic Rank Math
  const score = hasKeyword ? Math.round((passedChecks / totalChecks) * 100) || 0 : 0;
  
  useEffect(() => {
    if (onScoreChange) onScoreChange(score);
  }, [score, onScoreChange]);
  
  let scoreColor = 'bg-red-100 text-red-600 border-red-200';
  if (score > 50) scoreColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (score >= 80) scoreColor = 'bg-green-100 text-green-700 border-green-200';

  const CheckItem = ({ check }: { check: any }) => (
    <div className="flex items-start gap-3 py-2 text-[13px]">
      <div className="mt-0.5 shrink-0">
        {check.pass ? <CheckCircle2 className="w-[18px] h-[18px] text-[#22c55e] fill-[#22c55e]/20" /> : <XCircle className="w-[18px] h-[18px] text-[#ef4444] fill-[#ef4444]/20" />}
      </div>
      <div className="flex-1 text-[#333]">{check.pass ? check.passedText : check.text}</div>
      <div className="shrink-0 text-gray-400 hover:text-gray-600 cursor-pointer"><HelpCircle className="w-4 h-4" /></div>
    </div>
  );

  const Accordion = ({ title, errors, expanded, onToggle, checks }: any) => (
    <div className="border-t border-[#e2e4e7]">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 bg-[#f9f9f9] hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#1d2327]">{title}</span>
          {errors > 0 ? (
            <span className="bg-[#ffaba8] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">× {errors} Errors</span>
          ) : (
            <span className="bg-[#22c55e] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">✓ Good</span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {expanded && <div className="p-4 bg-white space-y-1">{checks.map((c: any, i: number) => <CheckItem key={i} check={c} />)}</div>}
    </div>
  );

  return (
    <div className="w-full bg-white border border-[#c3c4c7] shadow-sm font-sans mb-8">
      {/* Meta Box Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#c3c4c7] bg-white">
        <h2 className="text-[14px] font-semibold text-[#1d2327]">SEO</h2>
        <div className="flex items-center gap-1 text-gray-500">
          <ChevronUp className="w-5 h-5 cursor-pointer hover:text-blue-600" />
          <ChevronDown className="w-5 h-5 cursor-pointer hover:text-blue-600" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e4e7] bg-[#f9f9f9]">
        <button onClick={() => setActiveTab('general')} className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-[#0085ba] text-[#0085ba] bg-white' : 'border-transparent text-[#50575e] hover:text-[#0085ba]'}`}><Cog className="w-4 h-4" /> General</button>
        <button onClick={() => setActiveTab('advanced')} className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors ${activeTab === 'advanced' ? 'border-[#0085ba] text-[#0085ba] bg-white' : 'border-transparent text-[#50575e] hover:text-[#0085ba]'}`}><Briefcase className="w-4 h-4" /> Advanced</button>
        <button onClick={() => setActiveTab('schema')} className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors ${activeTab === 'schema' ? 'border-[#0085ba] text-[#0085ba] bg-white' : 'border-transparent text-[#50575e] hover:text-[#0085ba]'}`}><FileText className="w-4 h-4" /> Schema</button>
        <button onClick={() => setActiveTab('social')} className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors ${activeTab === 'social' ? 'border-[#0085ba] text-[#0085ba] bg-white' : 'border-transparent text-[#50575e] hover:text-[#0085ba]'}`}><Share2 className="w-4 h-4" /> Social</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="bg-white">
          <div className="p-5 border-b border-[#e2e4e7]">
            <h3 className="text-[13px] font-semibold text-[#1d2327] mb-3">Preview</h3>
            <div className="mb-4">
              <div className="text-[13px] text-[#006621] truncate mb-1">http://localhost:3000/{slug || 'sample-page'}/ <span className="text-gray-400">⋮</span></div>
              <div className="text-[18px] text-[#1a0dab] font-medium hover:underline cursor-pointer truncate mb-1">{title || 'Sample Page - Test'}</div>
              <div className="text-[13px] text-[#545454] leading-snug line-clamp-2">{metaDescription || "This is an example page. It's different from a blog post because it will stay in one place and will show up in your site navigation (in most themes)."}</div>
            </div>
            <button onClick={() => setIsSnippetExpanded(!isSnippetExpanded)} className="bg-[#0085ba] text-white text-[13px] px-4 py-1.5 rounded-[3px] hover:bg-[#0073aa] transition-colors">Edit Snippet</button>
            {isSnippetExpanded && (
              <div className="mt-4 p-4 bg-[#f9f9f9] border border-[#e2e4e7] rounded-sm space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba] outline-none" />
                  <div className={`h-1 mt-1 rounded-full ${title.length > 40 && title.length < 60 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (title.length / 60) * 100)}%` }} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1">Permalink</label>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba] outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1">Description</label>
                  <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba] outline-none" />
                  <div className={`h-1 mt-1 rounded-full ${metaDescription.length > 120 && metaDescription.length < 160 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (metaDescription.length / 160) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="p-5 border-b border-[#e2e4e7]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1 text-[13px] font-semibold text-[#1d2327]">Focus Keyword <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
              <TrendingUp className="w-5 h-5 text-gray-400 p-0.5 border border-gray-300 rounded-sm shadow-sm" />
            </div>
            <div className="relative flex items-center flex-wrap gap-1.5 border border-[#8c8f94] rounded-[3px] p-1.5 focus-within:border-[#0085ba] focus-within:ring-1 focus-within:ring-[#0085ba] pr-20 bg-white">
              {keywordsArray.map((keyword, index) => {
                const isPrimary = index === 0;
                return (
                  <div key={index} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-medium shadow-sm border ${isPrimary ? 'bg-[#f5a623] text-white border-[#e0961b]' : 'bg-[#fff5f5] text-[#d63f45] border-[#fbd3d3]'}`}>
                    <button onClick={() => removeKeyword(index)} className="hover:opacity-70 transition-opacity flex items-center justify-center bg-black/10 rounded-full w-3.5 h-3.5"><X className="w-2.5 h-2.5" /></button>
                    {isPrimary && <Star className="w-3 h-3 fill-current" />} {keyword}
                  </div>
                );
              })}
              {keywordsArray.length < 5 && <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeywordKeyDown} placeholder={keywordsArray.length === 0 ? "Insert keyword and press Enter" : ""} className="flex-1 min-w-[120px] outline-none text-[13px] bg-transparent py-0.5 px-1" />}
              <div className={`absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center font-semibold text-[13px] rounded-[2px] border bg-white z-10 ${scoreColor}`}>{score} / 100</div>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Add up to 5 focus keywords.</div>
          </div>
          <Accordion title="Basic SEO" errors={basicErrors} expanded={expanded.basic} onToggle={() => toggleAccordion('basic')} checks={basicChecks} />
          <Accordion title="Additional" errors={additionalErrors} expanded={expanded.additional} onToggle={() => toggleAccordion('additional')} checks={additionalChecks} />
          <Accordion title="Title Readability" errors={titleErrors} expanded={expanded.title} onToggle={() => toggleAccordion('title')} checks={titleChecks} />
          <Accordion title="Content Readability" errors={contentErrors} expanded={expanded.content} onToggle={() => toggleAccordion('content')} checks={contentChecks} />
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="bg-white p-5 space-y-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 text-[13px] font-semibold text-[#1d2327] uppercase">Robots Meta</div>
            <div className="col-span-8 grid grid-cols-2 gap-3 text-[13px] text-[#1d2327]">
              <label className="flex items-center gap-2"><input type="checkbox" checked={robotsIndex} onChange={handleIndexToggle} className="text-[#0085ba]" /> Index <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={robotsNoIndex} onChange={handleNoIndexToggle} className="text-[#0085ba]" /> No Index <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
              <label className="flex items-center gap-2"><input type="checkbox" className="text-[#0085ba]" /> Nofollow <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
              <label className="flex items-center gap-2"><input type="checkbox" className="text-[#0085ba]" /> No Archive <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
              <label className="flex items-center gap-2"><input type="checkbox" className="text-[#0085ba]" /> No Image Index <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
              <label className="flex items-center gap-2"><input type="checkbox" className="text-[#0085ba]" /> No Snippet <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
            </div>
          </div>
          <hr className="border-[#e2e4e7]" />
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 text-[13px] font-semibold text-[#1d2327] uppercase">Advanced Robots Meta</div>
            <div className="col-span-8 space-y-3 text-[13px] text-[#1d2327]">
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 w-40"><input type="checkbox" className="text-[#0085ba]" /> Max Snippet <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
                 <input type="text" defaultValue="-1" className="border border-[#8c8f94] rounded-[3px] px-3 py-1 w-24 outline-none" />
              </div>
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 w-40"><input type="checkbox" className="text-[#0085ba]" /> Max Video Preview <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
                 <input type="text" defaultValue="-1" className="border border-[#8c8f94] rounded-[3px] px-3 py-1 w-24 outline-none" />
              </div>
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 w-40"><input type="checkbox" className="text-[#0085ba]" /> Max Image Preview <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></label>
                 <select className="border border-[#8c8f94] rounded-[3px] px-3 py-1 w-32 outline-none"><option>Large</option><option>Standard</option><option>None</option></select>
              </div>
            </div>
          </div>
          <hr className="border-[#e2e4e7]" />
          <div className="grid grid-cols-12 gap-4 items-center">
             <div className="col-span-4 text-[13px] font-semibold text-[#1d2327] flex items-center gap-1">Canonical URL <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></div>
             <div className="col-span-8"><input type="text" placeholder="http://localhost:3000/sample-page/" className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#0085ba]" /></div>
          </div>
          <hr className="border-[#e2e4e7]" />
          <div className="grid grid-cols-12 gap-4 items-start">
             <div className="col-span-4 text-[13px] font-semibold text-[#1d2327] mt-1">Redirect</div>
             <div className="col-span-8 space-y-4">
                <div onClick={() => setIsRedirect(!isRedirect)} className={`w-9 h-5 rounded-full relative cursor-pointer shadow-inner transition-colors ${isRedirect ? 'bg-[#0085ba]' : 'bg-gray-300'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${isRedirect ? 'left-4' : 'left-0.5'}`}></div>
                </div>
                {isRedirect && (
                  <div className="space-y-3 bg-[#f9f9f9] p-4 border border-[#e2e4e7] rounded-[3px]">
                     <div>
                       <label className="block text-[12px] font-semibold text-[#1d2327] mb-1">Redirection Type</label>
                       <select className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] outline-none"><option>301 Permanent Move</option><option>302 Temporary Move</option></select>
                     </div>
                     <div>
                       <label className="block text-[12px] font-semibold text-[#1d2327] mb-1">Destination URL</label>
                       <input type="text" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://example.com" className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-1.5 text-[13px] outline-none" />
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-white p-5 space-y-6 min-h-[300px]">
          <div className="flex items-center justify-between border-b border-[#e2e4e7] pb-4">
            <h3 className="text-[14px] font-semibold text-[#1d2327]">Schema in Use</h3>
            <button onClick={() => setIsSchemaModalOpen(true)} className="bg-[#0085ba] text-white text-[13px] px-4 py-1.5 rounded-[3px] hover:bg-[#0073aa] transition-colors">Schema Generator</button>
          </div>
          <div className="border border-[#e2e4e7] rounded-[3px] p-4 flex items-center justify-between hover:border-[#0085ba] transition-colors bg-[#f9f9f9]">
            <div className="flex items-center gap-3">
               <FileText className="w-5 h-5 text-gray-500" />
               <span className="text-[13px] font-medium text-[#1d2327]">{selectedSchema}</span>
            </div>
            <div className="flex items-center gap-4 text-[13px] text-[#0085ba] font-semibold">
               <button onClick={() => setIsSchemaBuilderOpen(true)} className="hover:underline">Edit</button>
               <button className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
          <p className="text-[13px] text-gray-500">
            Schema Markup helps search engines understand your content better and can enhance your search results with rich snippets.
          </p>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="bg-white p-5 space-y-6 min-h-[300px]">
          <h3 className="text-[14px] font-semibold text-[#1d2327] mb-4">Social Preview</h3>
          <div className="border border-[#e2e4e7] rounded-[3px] overflow-hidden max-w-sm">
             <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400"><Share2 className="w-10 h-10 opacity-50" /></div>
             <div className="p-4 bg-[#f2f3f5]">
               <div className="text-[12px] text-gray-500 uppercase mb-1">yoursite.com</div>
               <div className="font-semibold text-[#1d2327] line-clamp-1">{title || 'Sample Title'}</div>
               <div className="text-[13px] text-gray-600 line-clamp-2 mt-1">{metaDescription || 'Sample description for social sharing.'}</div>
             </div>
          </div>
        </div>
      )}

      {/* Schema Generator Modal */}
      {isSchemaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
             <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e4e7]">
               <h2 className="text-[16px] font-semibold text-[#1d2327]">Schema Generator</h2>
               <button onClick={() => setIsSchemaModalOpen(false)} className="hover:bg-gray-100 p-1 rounded transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
             </div>
             <div className="flex px-6 border-b border-[#e2e4e7] bg-[#f9f9f9]">
               <button onClick={() => setSchemaModalTab('templates')} className={`flex items-center gap-2 px-6 py-4 text-[13px] font-medium border-b-2 transition-colors ${schemaModalTab === 'templates' ? 'border-[#0085ba] text-[#0085ba] bg-white' : 'border-transparent text-[#50575e] hover:text-[#0085ba]'}`}><FileText className="w-4 h-4" /> Schema Templates</button>
               <button onClick={() => setSchemaModalTab('custom')} className={`flex items-center gap-2 px-6 py-4 text-[13px] font-medium border-b-2 transition-colors ${schemaModalTab === 'custom' ? 'border-[#0085ba] text-[#0085ba] bg-white' : 'border-transparent text-[#50575e] hover:text-[#0085ba]'}`}><PlusCircle className="w-4 h-4" /> Custom Schema</button>
             </div>
             <div className="flex-1 overflow-y-auto p-6 bg-white">
               {schemaModalTab === 'templates' && (
                 <div>
                   <h3 className="text-[13px] font-bold text-[#1d2327] mb-4">Available Schema Types</h3>
                   <div className="grid grid-cols-2 gap-4">
                     {schemaTypes.map((schema) => {
                       const isSelected = selectedSchema === schema.name;
                       return (
                         <div key={schema.name} className={`flex items-center justify-between p-3 border rounded-[3px] transition-colors cursor-default ${isSelected ? 'border-[#0085ba] bg-blue-50/30' : 'border-[#e2e4e7] hover:border-gray-300'}`}>
                           <div className="flex items-center gap-3">
                             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#0085ba]' : 'border-gray-300'}`}>
                               {isSelected && <div className="w-2 h-2 rounded-full bg-[#0085ba]" />}
                             </div>
                             <schema.icon className={`w-4 h-4 ${isSelected ? 'text-[#0085ba]' : 'text-gray-400'}`} />
                             <span className={`text-[13px] ${isSelected ? 'text-[#0085ba] font-medium' : 'text-[#50575e]'}`}>{schema.name}</span>
                             {schema.pro && <span className="bg-[#22c55e] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] ml-1">PRO</span>}
                           </div>
                           <button onClick={() => { setSelectedSchema(schema.name); setIsSchemaModalOpen(false); setIsSchemaBuilderOpen(true); }} className={`flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-[3px] border ${isSelected ? 'text-[#0085ba] border-[#0085ba] bg-white' : 'text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
                             <PlusCircle className="w-3.5 h-3.5" /> Use
                           </button>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}
               {schemaModalTab === 'custom' && (
                 <div className="h-full flex flex-col">
                   <h3 className="text-[14px] font-semibold text-[#1d2327] mb-2">Custom Schema (JSON-LD)</h3>
                   <p className="text-[13px] text-gray-500 mb-4">Add your own custom JSON-LD schema markup below. It will be injected directly into the page's head tag.</p>
                   <textarea value={customSchemaJson} onChange={(e) => setCustomSchemaJson(e.target.value)} placeholder="{\n  &quot;@context&quot;: &quot;https://schema.org&quot;,\n  &quot;@type&quot;: &quot;Event&quot;,\n  ...\n}" className="flex-1 w-full border border-[#8c8f94] rounded-[3px] p-4 text-[13px] font-mono outline-none focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba] min-h-[300px]" />
                   <div className="mt-4 flex justify-end">
                     <button onClick={() => setIsSchemaModalOpen(false)} className="bg-[#0085ba] text-white px-5 py-2 rounded-[3px] text-[13px] font-medium hover:bg-[#0073aa] transition-colors">Save Custom Schema</button>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {/* Schema Builder Modal (Edit Mode) */}
      {isSchemaBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
             
             {/* Fake Rank Math Tabs Header */}
             <div className="flex items-center justify-between px-4 py-2 border-b border-[#e2e4e7] bg-white">
               <h2 className="text-[14px] font-semibold text-[#1d2327]">Schema Builder</h2>
               <button onClick={() => setIsSchemaBuilderOpen(false)} className="p-1 hover:text-red-500"><X className="w-5 h-5 text-gray-500" /></button>
             </div>
             
             <div className="flex border-b border-[#e2e4e7] bg-white">
                <div className="px-6 py-3 text-[13px] font-medium text-[#0085ba] border-b-2 border-[#0085ba]">Edit</div>
                <div className="px-6 py-3 text-[13px] font-medium text-gray-500">Code Validation</div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-[#f0f0f1] space-y-4">
               
               <div className="flex justify-between items-center bg-white p-3 border border-[#e2e4e7] rounded-[3px]">
                 <span className="font-semibold text-[13px] text-[#1d2327]">{selectedSchema}</span>
                 <Info className="w-4 h-4 text-gray-400" />
               </div>

               {(schemaFieldDefinitions[selectedSchema] || []).map((field, idx) => {
                 const fieldKey = `${selectedSchema}_${field.label}`;
                 const val = schemaData[fieldKey] || '';
                 
                 if (field.type === 'section') {
                   return (
                     <div key={idx} className="mt-6 mb-2">
                       <span className="font-semibold text-[14px] text-[#1d2327]">{field.label}</span>
                     </div>
                   );
                 }
                 
                 if (field.type === 'info') {
                   return (
                     <div key={idx} className="border border-[#e2e4e7] rounded-[3px] bg-white">
                       <div className="p-3 text-[11px] font-bold text-[#1d2327] border-b border-[#e2e4e7] uppercase">{field.label}</div>
                       <div className="p-4 text-[13px] text-gray-600 whitespace-pre-wrap leading-relaxed">{field.info}</div>
                     </div>
                   );
                 }
                 
                 if (field.type === 'group') {
                   return (
                     <div key={idx} className="border border-[#e2e4e7] rounded-[3px] bg-white">
                       <div className="p-3 text-[11px] font-bold text-[#1d2327] border-b border-[#e2e4e7] uppercase">{field.label}</div>
                       <div className="p-4">
                         <button className="text-[13px] font-medium text-[#0085ba] bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-[3px] hover:bg-white hover:border-[#0085ba]">Add Property</button>
                       </div>
                     </div>
                   );
                 }

                 return (
                   <div key={idx} className="border border-[#e2e4e7] rounded-[3px] bg-white">
                     <div className="p-3 text-[11px] font-bold text-[#1d2327] border-b border-[#e2e4e7] uppercase">
                       {field.label.replace(' *', '')} {field.label.includes('*') && <span className="text-red-500">*</span>}
                     </div>
                     <div className="p-4">
                       {field.type === 'text' && (
                         <input 
                           type="text" 
                           value={val}
                           onChange={(e) => handleSchemaDataChange(field.label, e.target.value)}
                           placeholder={field.placeholder}
                           className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13px] focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba] outline-none shadow-inner" 
                         />
                       )}
                       
                       {field.type === 'textarea' && (
                         <textarea 
                           value={val}
                           onChange={(e) => handleSchemaDataChange(field.label, e.target.value)}
                           placeholder={field.placeholder}
                           rows={4}
                           className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13px] focus:border-[#0085ba] focus:ring-1 focus:ring-[#0085ba] outline-none shadow-inner" 
                         />
                       )}
                       
                       {field.type === 'radio' && field.options && (
                         <div className="space-y-3">
                           {field.options.map(opt => (
                             <label key={opt} className="flex items-center gap-2 text-[13px] text-[#1d2327]">
                               <input 
                                 type="radio" 
                                 name={`radio_${fieldKey}`}
                                 checked={val === opt || (val === '' && opt === field.options![0])}
                                 onChange={() => handleSchemaDataChange(field.label, opt)}
                                 className="w-4 h-4 text-[#0085ba] border-gray-300 focus:ring-[#0085ba]"
                               />
                               {opt}
                             </label>
                           ))}
                         </div>
                       )}

                       {field.info && <div className="mt-2 text-[12px] text-gray-500">{field.info}</div>}
                     </div>
                   </div>
                 );
               })}
             </div>

             <div className="p-4 bg-white border-t border-[#e2e4e7]">
               <button 
                 onClick={() => setIsSchemaBuilderOpen(false)}
                 className="bg-[#0085ba] text-white px-5 py-2.5 rounded-[3px] text-[14px] font-semibold hover:bg-[#0073aa]"
               >
                 Save for this Post
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
