'use client';

import type { SourceLink } from '@/lib/types';

/** Single external link with icon */
export function ExternalLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 hover:underline transition-colors"
    >
      {label}
      <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

/** Row of source links */
export function SourceLinks({ sources }: { sources: SourceLink[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 mt-2">
      <span className="text-[11px] text-gray-400">Sources:</span>
      {sources.map((s, i) => (
        <ExternalLink key={i} url={s.url} label={s.label} />
      ))}
    </div>
  );
}
