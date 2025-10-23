'use client'

import React from 'react';
import StructuredText from './StructuredText';

const sampleMarkdownOutput = `# Legal Document Analysis Report

## Executive Summary

This document analysis reveals several key findings regarding the contract terms and potential legal implications.

### Key Findings

- **Contract Duration**: The agreement spans 24 months with automatic renewal clauses
- **Payment Terms**: Net 30 days with late payment penalties of 2% per month
- **Termination Clauses**: Either party may terminate with 60 days written notice

## Detailed Analysis

### 1. Contract Structure

The contract follows standard commercial law practices with the following structure:

1. **Parties**: Clear identification of contracting entities
2. **Scope of Work**: Detailed description of services to be provided
3. **Payment Schedule**: Milestone-based payments with defined deliverables
4. **Intellectual Property**: Clear ownership and licensing terms

### 2. Risk Assessment

| Risk Category | Level | Mitigation Strategy |
|---------------|-------|-------------------|
| Payment Default | Medium | Require advance payment |
| Scope Creep | High | Define clear deliverables |
| IP Disputes | Low | Comprehensive IP clauses |

### 3. Code Examples

Here's a sample contract clause:

\`\`\`javascript
function calculatePenalty(amount, daysLate) {
    const dailyRate = 0.02 / 30; // 2% annual rate
    return amount * dailyRate * daysLate;
}
\`\`\`

### 4. Recommendations

> **Important**: We recommend adding a force majeure clause to protect against unforeseen circumstances.

#### Immediate Actions Required

- [ ] Review payment terms with legal counsel
- [ ] Add termination penalty calculations
- [ ] Include dispute resolution mechanism

#### Long-term Considerations

- [ ] Regular contract review schedule
- [ ] Performance metrics definition
- [ ] Insurance requirements

## Conclusion

The contract is generally well-structured but requires minor modifications to address identified risks. The proposed changes will enhance legal protection while maintaining commercial viability.

---

*Report generated on ${new Date().toLocaleDateString()} by Legal Analysis AI*`;

export default function MarkdownTest() {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Markdown Renderer Test</h2>
            <div className="border border-gray-200 rounded-lg p-4">
                <StructuredText text={sampleMarkdownOutput} />
            </div>
        </div>
    );
}
