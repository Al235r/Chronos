import { HistoricalEntity } from "../types";

export interface LayoutItem {
  entity: HistoricalEntity;
  lane: number;
  region: string;
  globalY: number;
}

export interface RegionInfo {
  name: string;
  startY: number;
  height: number;
  color: string;
}

// Helper to determine region based on location string or explicit mapping
export const getRegion = (locationObj: { en: string, ru: string }): string => {
  const loc = locationObj.en.toLowerCase();
  
  if (loc.includes('africa') || loc.includes('egypt')) return 'Africa';
  if (loc.includes('mesopotamia') || loc.includes('levant') || loc.includes('anatolia') || loc.includes('iraq') || loc.includes('sumer') || loc.includes('ottoman') || loc.includes('persia')) return 'Middle East';
  if (loc.includes('europe') || loc.includes('rome') || loc.includes('greece') || loc.includes('crete') || loc.includes('spain') || loc.includes('france') || loc.includes('scandinavia') || loc.includes('rus')) return 'Europe';
  if (loc.includes('china') || loc.includes('india') || loc.includes('asia') || loc.includes('mongol') || loc.includes('japan')) return 'Asia';
  if (loc.includes('america') || loc.includes('usa') || loc.includes('mexico') || loc.includes('peru')) return 'Americas';
  
  return 'Global / Eurasia';
};

export const REGION_ORDER = ['Africa', 'Middle East', 'Europe', 'Asia', 'Americas', 'Global / Eurasia'];
export const REGION_COLORS: Record<string, string> = {
    'Africa': '#78350f', // Amber-900
    'Middle East': '#713f12', // Yellow-900 (Gold-ish)
    'Europe': '#1e3a8a', // Blue-900
    'Asia': '#831843', // Pink-900 (Red-ish)
    'Americas': '#14532d', // Green-900
    'Global / Eurasia': '#3f3f46' // Zinc-700
};

export const calculateLayout = (items: HistoricalEntity[]): { itemMap: Map<string, LayoutItem>, regions: RegionInfo[] } => {
  const itemMap = new Map<string, LayoutItem>();
  const regions: RegionInfo[] = [];

  // 1. Group items by region
  const grouped = new Map<string, HistoricalEntity[]>();
  REGION_ORDER.forEach(r => grouped.set(r, []));

  items.forEach(item => {
    const region = getRegion(item.location);
    if (!grouped.has(region)) {
        // Fallback for unmapped regions
        if (!grouped.has('Global / Eurasia')) grouped.set('Global / Eurasia', []);
        grouped.get('Global / Eurasia')!.push(item);
    } else {
        grouped.get(region)!.push(item);
    }
  });

  let currentGlobalY = 0;
  const LANE_HEIGHT = 50; // Height of card + gap
  const REGION_PADDING_TOP = 30; // Reduced for compactness
  const REGION_PADDING_BOTTOM = 20;

  // 2. Process each region
  REGION_ORDER.forEach(regionName => {
    const regionItems = grouped.get(regionName) || [];
    if (regionItems.length === 0) return;

    // Sort by start year for packing
    regionItems.sort((a, b) => a.startYear - b.startYear);

    // Lane Packing Logic (Local to region)
    const laneOccupancy: Array<Array<{start: number, end: number}>> = [];
    let maxLane = 0;

    regionItems.forEach(item => {
      let lane = 0;
      let placed = false;

      while (!placed) {
        if (!laneOccupancy[lane]) laneOccupancy[lane] = [];
        
        // Check overlap
        const buffer = (item.endYear - item.startYear) * 0.05;
        const hasOverlap = laneOccupancy[lane].some(r => 
           Math.max(item.startYear, r.start) < Math.min(item.endYear, r.end) + buffer
        );

        if (!hasOverlap) {
          laneOccupancy[lane].push({ start: item.startYear, end: item.endYear });
          placed = true;
        } else {
          lane++;
        }
      }

      maxLane = Math.max(maxLane, lane);
      
      // Store result
      itemMap.set(item.id, {
        entity: item,
        lane: lane,
        region: regionName,
        globalY: currentGlobalY + REGION_PADDING_TOP + (lane * LANE_HEIGHT)
      });
    });

    const regionHeight = REGION_PADDING_TOP + ((maxLane + 1) * LANE_HEIGHT) + REGION_PADDING_BOTTOM;

    regions.push({
      name: regionName,
      startY: currentGlobalY,
      height: regionHeight,
      color: REGION_COLORS[regionName] || '#333'
    });

    currentGlobalY += regionHeight;
  });

  return { itemMap, regions };
};