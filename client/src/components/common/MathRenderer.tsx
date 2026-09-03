import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  content?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

interface Segment {
  type: 'text' | 'inline-math' | 'block-math';
  value: string;
}

/**
 * Reusable mathematical text renderer using KaTeX.
 * Parses mixed strings containing plain text, inline math ($...$), and block math ($$...$$).
 * Strips raw syntax ($ and curly braces) and renders formatted formulas.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className, style }) => {
  if (!content) return null;

  // Tokenize string into text, inline-math, and block-math
  const segments: Segment[] = [];
  let remaining = content;

  // Regex pattern matching $$...$$ (block) or $...$ (inline)
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/;

  while (remaining.length > 0) {
    const match = remaining.match(mathRegex);

    if (!match || match.index === undefined) {
      segments.push({ type: 'text', value: remaining });
      break;
    }

    // Push preceding text segment if any
    if (match.index > 0) {
      segments.push({ type: 'text', value: remaining.slice(0, match.index) });
    }

    const matchedToken = match[0];
    if (matchedToken.startsWith('$$') && matchedToken.endsWith('$$')) {
      // Block math
      const mathFormula = matchedToken.slice(2, -2).trim();
      segments.push({ type: 'block-math', value: mathFormula });
    } else if (matchedToken.startsWith('$') && matchedToken.endsWith('$')) {
      // Inline math
      const mathFormula = matchedToken.slice(1, -1).trim();
      segments.push({ type: 'inline-math', value: mathFormula });
    } else {
      segments.push({ type: 'text', value: matchedToken });
    }

    remaining = remaining.slice(match.index + matchedToken.length);
  }

  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {segments.map((seg, idx) => {
        if (seg.type === 'block-math') {
          return (
            <span key={idx} style={{ display: 'block', margin: '10px 0', textAlign: 'center' }}>
              <BlockMath
                math={seg.value}
                renderError={(_error: any) => (
                  <span style={{ color: '#EF4444', fontSize: '13px' }}>{seg.value}</span>
                )}
              />
            </span>
          );
        }

        if (seg.type === 'inline-math') {
          return (
            <span key={idx} style={{ display: 'inline-block', margin: '0 2px' }}>
              <InlineMath
                math={seg.value}
                renderError={(_error: any) => (
                  <span style={{ color: '#EF4444', fontSize: '13px' }}>{seg.value}</span>
                )}
              />
            </span>
          );
        }

        // Render plain text preserving whitespace and newlines
        const lines = seg.value.split('\n');
        return (
          <React.Fragment key={idx}>
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {line}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </span>
  );
};
