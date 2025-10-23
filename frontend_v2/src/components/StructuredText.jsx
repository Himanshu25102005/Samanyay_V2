'use client'

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function StructuredText({ text }) {
    if (!text || typeof text !== 'string') return null;

    const rawText = text.trim();

    return (
        <div className="markdown-content prose prose-sm md:prose-base max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom styling for headings
                    h1: ({ children }) => (
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 mt-6 border-b border-gray-200 pb-2">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 mt-5">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 mt-4">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2 mt-3">
                            {children}
                        </h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="text-sm md:text-base font-semibold text-gray-800 mb-1 mt-2">
                            {children}
                        </h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="text-sm font-semibold text-gray-800 mb-1 mt-2">
                            {children}
                        </h6>
                    ),
                    
                    // Custom styling for paragraphs
                    p: ({ children }) => (
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed md:leading-7 mb-3">
                            {children}
                        </p>
                    ),
                    
                    // Custom styling for lists
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside text-gray-700 text-sm md:text-base space-y-1 mb-3 ml-4">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-gray-700 text-sm md:text-base space-y-1 mb-3 ml-4">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed">
                            {children}
                        </li>
                    ),
                    
                    // Custom styling for code blocks
                    code: ({ children, className }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={className}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">
                            {children}
                        </pre>
                    ),
                    
                    // Custom styling for blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4 bg-blue-50 py-2 rounded-r">
                            {children}
                        </blockquote>
                    ),
                    
                    // Custom styling for tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full border border-gray-300 rounded-lg">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-50">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="bg-white">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="border-b border-gray-200">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300 last:border-r-0">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-300 last:border-r-0">
                            {children}
                        </td>
                    ),
                    
                    // Custom styling for links
                    a: ({ children, href }) => (
                        <a 
                            href={href} 
                            className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    
                    // Custom styling for horizontal rules
                    hr: () => (
                        <hr className="border-gray-300 my-6" />
                    ),
                    
                    // Custom styling for strong/bold text
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                            {children}
                        </strong>
                    ),
                    
                    // Custom styling for emphasis/italic text
                    em: ({ children }) => (
                        <em className="italic text-gray-700">
                            {children}
                        </em>
                    ),
                }}
            >
                {rawText}
            </ReactMarkdown>
        </div>
    );
}


