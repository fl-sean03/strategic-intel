import { RiskLevel } from './types';

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

export function getRiskColor(score: number): string {
  const level = getRiskLevel(score);
  return RISK_COLORS[level];
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#DC2626',
  high: '#D97706',
  moderate: '#2563EB',
  low: '#059669',
};

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  critical: 'bg-risk-critical/10 text-risk-critical border-risk-critical/20',
  high: 'bg-risk-high/10 text-risk-high border-risk-high/20',
  moderate: 'bg-risk-moderate/10 text-risk-moderate border-risk-moderate/20',
  low: 'bg-risk-low/10 text-risk-low border-risk-low/20',
};

export function getRiskBgClass(score: number): string {
  return RISK_BG_CLASSES[getRiskLevel(score)];
}

export function formatPct(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  // Round to 1 decimal, but show integer if .0
  const rounded = Math.round(value * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}
