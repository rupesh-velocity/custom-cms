import FrontendForm from './FrontendForm';

export default function ContentRenderer({ html, className = '' }: { html: string, className?: string }) {
  // Split by [form id="X"]
  // The capturing group (\d+) ensures the ID is kept in the resulting array at odd indices
  const parts = html.split(/\[form id="(\d+)"\]/g);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        // Odd indices are the captured form IDs
        if (index % 2 === 1) {
          return <FrontendForm key={index} id={part} />;
        }
        
        // Even indices are the regular HTML chunks
        if (!part) return null;
        return (
          <div key={index} dangerouslySetInnerHTML={{ __html: part }} />
        );
      })}
    </div>
  );
}
