import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return formatTimestamp(d);
}

export function getRiskColor(score: number): string {
  if (score >= 80) return '#ff3355';
  if (score >= 60) return '#ffb800';
  if (score >= 40) return '#00d4ff';
  return '#00ff88';
}

export function getRiskLabel(score: number): string {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    emergency: '#ff3355',
    critical: '#ff3355',
    warning: '#ffb800',
    info: '#00d4ff',
    low: '#00ff88',
  };
  return map[severity.toLowerCase()] ?? '#7fa3c4';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}
