import type { Evidence } from './contracts';

export function kindLabel(kind: Evidence['kind']): string {
  return kind === 'deployment' ? 'Deploy event' : kind.charAt(0).toUpperCase() + kind.slice(1);
}

/** HH:MM:SS from a UTC ISO timestamp, as recorded in the bundle. */
export function clock(timestamp: string | null): string {
  return timestamp ? timestamp.slice(11, 19) : 'Untimed';
}

/** Two-digit readout for ledger figures ("03", "25", "118"). */
export function figure(value: number): string {
  return String(value).padStart(2, '0');
}

/** Short citation label: "s001-e03" → "03", "s001-r01" → "R01". */
export function citationLabel(id: string): string {
  return id.split('-').at(-1)?.replace('e', '').replace('r', 'R') ?? id;
}
