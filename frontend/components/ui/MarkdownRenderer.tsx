
import React from 'react';

export const InlineFormat = ({ text }: { text: string }) => {
  // Simple regex to parse **bold** text
  const parts = text.split(/(\*\*.*?\*\*)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-gray-900 dark:text-blue-200">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export const FormattedMessage = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        
        // Header 3 (### Title)
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="text-lg font-bold text-blue-700 dark:text-blue-400 mt-5 mb-2">
              <InlineFormat text={line.replace('### ', '')} />
            </h3>
          );
        }
        
        // Header 2 or 1 treated similarly
        if (line.startsWith('## ')) {
            return (
              <h2 key={i} className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-6 mb-3">
                <InlineFormat text={line.replace('## ', '')} />
              </h2>
            );
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-3 ml-1 mb-1">
              <span className="text-blue-500 dark:text-blue-400/80 mt-1.5 text-[10px] font-bold">●</span>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                <InlineFormat text={trimmed.replace(/^[-*] /, '')} />
              </p>
            </div>
          );
        }

        // Empty lines for spacing
        if (!trimmed) {
          return <div key={i} className="h-3" />;
        }

        // Standard Paragraph
        return (
          <p key={i} className="text-gray-800 dark:text-gray-200 leading-relaxed mb-1">
            <InlineFormat text={line} />
          </p>
        );
      })}
    </div>
  );
};
