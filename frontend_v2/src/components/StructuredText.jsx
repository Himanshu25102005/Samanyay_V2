'use client'

import React from 'react';

export default function StructuredText({ text }) {
    if (!text || typeof text !== 'string') return null;

    const rawText = text.trim();

    // Detect sections like "HEADING:" (all caps, may include spaces, /, &, -)
    const sectionRegex = /(\n|^)([A-Z][A-Z\s/&\-]{3,}?):\s*/g;
    const sections = [];
    let lastIndex = 0;
    let match;

    while ((match = sectionRegex.exec(rawText)) !== null) {
        const headingStart = match.index + match[1].length;
        const heading = match[2].trim();
        if (sections.length === 0 && headingStart > 0) {
            const preface = rawText.slice(0, match.index).trim();
            if (preface) sections.push({ title: null, body: preface });
        }
        if (lastIndex !== 0) {
            const prev = rawText.slice(lastIndex, match.index).trim();
            if (prev) sections[sections.length - 1].body += `\n${prev}`;
        }
        sections.push({ title: heading, body: '' });
        lastIndex = sectionRegex.lastIndex;
    }

    if (sections.length === 0) {
        sections.push({ title: null, body: rawText });
    } else {
        const tail = rawText.slice(lastIndex).trim();
        if (tail) sections[sections.length - 1].body += (sections[sections.length - 1].body ? '\n' : '') + tail;
    }

    const splitBodyIntoBlocks = (body) => {
        if (!body) return [];
        // Prefer list split on " - " if there are multiple bullets
        const dashParts = body.split(/\s-\s+/).filter(Boolean);
        if (dashParts.length >= 4) {
            return [{ type: 'list', items: dashParts.map(s => s.replace(/^[\-\u2022]+\s*/, '').trim()).filter(Boolean) }];
        }
        // Otherwise split on semicolons when many
        const semiParts = body.split(/;\s+/).filter(Boolean);
        if (semiParts.length >= 5) {
            return [{ type: 'list', items: semiParts }];
        }
        // Otherwise paragraphs
        const paraParts = body
            .split(/\n{2,}/)
            .flatMap(p => p.split(/(?<=[.!?])\s{2,}/))
            .map(p => p.trim())
            .filter(Boolean);
        return paraParts.map(p => ({ type: 'para', text: p }));
    };

    return (
        <div className="space-y-4">
            {sections.map((sec, i) => {
                const blocks = splitBodyIntoBlocks(sec.body);
                return (
                    <div key={i} className="space-y-2">
                        {sec.title && (
                            <h4 className="text-sm md:text-base font-semibold text-gray-900">{sec.title}</h4>
                        )}
                        {blocks.map((b, j) => b.type === 'para' ? (
                            <p key={j} className="text-gray-800 text-sm md:text-base leading-relaxed md:leading-7">{b.text}</p>
                        ) : (
                            <ul key={j} className="list-disc pl-5 space-y-1 text-gray-800 text-sm md:text-base">
                                {b.items.map((it, k) => (
                                    <li key={k} className="leading-relaxed">{it}</li>
                                ))}
                            </ul>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}


