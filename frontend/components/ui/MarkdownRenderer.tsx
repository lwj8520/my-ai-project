"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`text-xs md:text-sm text-gray-800 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base md:text-lg font-bold text-gray-900 mt-3 mb-1.5 pb-1 border-b border-gray-200/60">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm md:text-base font-bold text-gray-900 mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs md:text-sm font-bold text-gray-900 mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed break-words last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 pl-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed marker:text-rose-400">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-950 bg-rose-50/70 px-0.5 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-rose-300 pl-3 py-0.5 my-2 italic text-gray-600 bg-rose-50/20 rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs font-mono text-rose-600">
              {children}
            </code>
          ),
          hr: () => <hr className="my-3 border-gray-200" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 font-medium underline underline-offset-2 hover:text-rose-600 transition"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
