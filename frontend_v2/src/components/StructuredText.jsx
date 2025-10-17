'use client'

import React from 'react';

export default function StructuredText({ text }) {
    if (!text || typeof text !== 'string') return null;

    const rawText = text.trim();

    // Build sections by scanning lines and detecting headings
    const lines = rawText.split(/\n/);
    const sections = [];
    let current = { title: null, bodyLines: [] };

    // Helper: is a visual separator line
    const isSeparator = (l) => /^(=|-|_){3,}\s*$/.test(l);
    // Helper: is an ALL CAPS heading line without trailing punctuation
    const isAllCapsHeading = (l) => {
        const s = l.trim();
        if (!s) return false;
        if (/[:.;]$/.test(s)) return false; // those are handled elsewhere
        if (s.length < 6 || s.length > 100) return false;
        // Consider words in caps, digits and allowed symbols
        if (!/^[A-Z0-9\s/&\-]+$/.test(s)) return false;
        // Require at least one alpha
        if (!/[A-Z]/.test(s)) return false;
        return true;
    };
    // Helper: lines that are explicit colon headings (e.g., HEADING: content starts next lines)
    const colonHeadingMatch = (l) => {
        const m = l.match(/^([A-Z][A-Z\s/&\-]{3,}?):\s*$/);
        return m ? m[1].trim() : null;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isSeparator(line)) {
            continue; // skip separators entirely
        }
        const colonHead = colonHeadingMatch(line);
        if (colonHead) {
            // flush previous section
            if (current.title !== null || current.bodyLines.length) {
                sections.push({ title: current.title, body: current.bodyLines.join('\n').trim() });
            }
            current = { title: colonHead, bodyLines: [] };
            continue;
        }
        if (isAllCapsHeading(line)) {
            // Lookahead: if next line is a separator, treat this as heading
            const next = lines[i + 1] || '';
            if (isSeparator(next) || (current.bodyLines.length === 0 && (current.title !== null || sections.length > 0))) {
                if (current.title !== null || current.bodyLines.length) {
                    sections.push({ title: current.title, body: current.bodyLines.join('\n').trim() });
                }
                current = { title: line.trim(), bodyLines: [] };
                continue;
            }
        }
        current.bodyLines.push(line);
    }
    if (current.title !== null || current.bodyLines.length) {
        sections.push({ title: current.title, body: current.bodyLines.join('\n').trim() });
    }

    const splitBodyIntoBlocks = (body) => {
        if (!body) return [];
        // Very conservative list detection: only treat as list if clear bullet markers at line starts
        const lines = body.split(/\n+/).map(l => l.trim()).filter(Boolean);
        const bulletLines = lines.filter(l => /^([\u2022\-\*]|\d+\.)\s+/.test(l));
        if (bulletLines.length >= 5 && bulletLines.length >= Math.ceil(lines.length * 0.7)) {
            const items = lines
                .map(s => s.replace(/^([\u2022\-\*]|\d+\.)\s+/, '').trim())
                .filter(Boolean);
            return [{ type: 'list', items }];
        }
        // Default to paragraphs with natural sentence/paragraph flow
        const paraParts = body
            .split(/\n{2,}/)
            .flatMap(p => p.split(/(?<=[.!?])\s{2,}/))
            .map(p => p.replace(/^([\u2022\-\*]|\d+\.)\s+/, '').trim())
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
                            <h4 className="text-base md:text-lg font-bold text-gray-900">{sec.title}</h4>
                        )}
                        {blocks.map((b, j) => b.type === 'para' ? (
                            <p key={j} className="text-gray-800 text-sm md:text-base leading-relaxed md:leading-7">{b.text}</p>
                        ) : (
                            <div key={j} className="space-y-2 text-gray-800 text-sm md:text-base">
                                {b.items.map((it, k) => (
                                    <p key={k} className="leading-relaxed">{it}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}


