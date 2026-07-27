import FrontendForm from './FrontendForm';
import Breadcrumbs from './Breadcrumbs';

export default function ContentRenderer({ html, className = '' }: { html: string, className?: string }) {
  // Clean up wrapping <p> tags around shortcodes if they are the only content in the paragraph
  const cleanHtml = html.replace(/<p>\s*(\[form id="\d+"\]|\[breadcrumbs\])\s*<\/p>/g, '$1');
  
  // Split by [form id="X"] or [breadcrumbs]
  const parts = cleanHtml.split(/(\[form id="\d+"\]|\[breadcrumbs\])/g);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (!part) return null;
        
        if (part === '[breadcrumbs]') {
          return <Breadcrumbs key={index} />;
        }
        
        const formMatch = part.match(/\[form id="(\d+)"\]/);
        if (formMatch) {
          return <FrontendForm key={index} id={formMatch[1]} />;
        }

        return (
          <div key={index} dangerouslySetInnerHTML={{ __html: part }} />
        );
      })}
    </div>
  );
}
