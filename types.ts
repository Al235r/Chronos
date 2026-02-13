export type Language = 'en' | 'ru';

export interface LocalizedString {
  en: string;
  ru: string;
}

export type EntityType = 'culture' | 'civilization' | 'state' | 'empire' | 'kingdom' | 'period' | 'event';

export interface SubEvent {
  year: number;
  title?: LocalizedString; // Short title for map display
  description: LocalizedString;
}

export interface HistoricalEntity {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  location: LocalizedString;
  startYear: number; // Negative for BC
  endYear: number;
  type: EntityType;
  wikiLink?: string;
  lane?: number; // Manual vertical positioning lane index
  events?: SubEvent[]; // Specific key events/dots for this entity
}

export interface ViewportState {
  scale: number; // Pixels per year
  offsetX: number; // Horizontal translation
  offsetY: number; // Vertical translation
}

export const MIN_YEAR = -3000000; // 3 Million years ago
export const MAX_YEAR = 2025;
export const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;
export const MIN_ZOOM = 0.0001; // Allow zooming out to see millions of years
export const MAX_ZOOM = 20;   // 20 pixels = 1 year