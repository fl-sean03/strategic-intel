'use client';

import { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';

interface ComparisonBarProps {
  items: {
    label: string;
    value: number;
    color?: string;
  }[];
  title: string;
  formatValue?: (v: number) => string;
}

export default function ComparisonBar({
  items, title, formatValue = (v) => v.toLocaleString(),
}: ComparisonBarProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  const handleExport = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: { padding: '16px' },
      });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [title]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <button
          onClick={handleExport}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          title="Export as PNG"
          aria-label="Export chart as PNG"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
      <div ref={chartRef}>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-24 text-right shrink-0">
                {item.label}
              </span>
              <div className="flex-1 gauge-bar h-5 flex items-center">
                <div
                  className="gauge-fill h-full flex items-center px-2"
                  style={{
                    width: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                    backgroundColor: item.color || '#1E3A5F',
                  }}
                >
                  <span className="text-[11px] text-white font-medium whitespace-nowrap">
                    {formatValue(item.value)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-gray-300 text-right mt-2">Strategic Industrial Intelligence</div>
      </div>
    </div>
  );
}
