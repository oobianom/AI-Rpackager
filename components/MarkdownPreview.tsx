import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownPreviewProps {
  content: string;
  isDarkTheme: boolean;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, isDarkTheme }) => {
  const parsedContent = useMemo(() => {
    try {
        return marked.parse(content, { async: false });
    } catch (e) {
        console.error("Markdown parsing error:", e);
        return "<p>Error parsing Markdown.</p>";
    }
  }, [content]);

  return (
    <div className={`h-full w-full overflow-y-auto custom-scrollbar ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div
        className="markdown-preview"
        dangerouslySetInnerHTML={{ __html: parsedContent as string }}
      />
    </div>
  );
};

export default MarkdownPreview;