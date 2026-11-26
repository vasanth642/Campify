import React from "react";

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;

export function linkify(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts = text.split(URL_REGEX);

  return parts.map((part, index) => {
    if (part && part.match(URL_REGEX)) {
      let href = part;
      if (!href.startsWith("http://") && !href.startsWith("https://")) {
        href = `https://${href}`;
      }

      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-400 underline underline-offset-2 transition-colors hover:text-blue-300"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
