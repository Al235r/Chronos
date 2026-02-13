import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { ViewportState, HistoricalEntity, Language, MIN_ZOOM, MAX_ZOOM, MIN_YEAR } from '../types';
import { calculateLayout, RegionInfo } from '../utils/layout';
import { formatYearSmart } from '../utils/formatting';

interface TimelineBoardProps {
  data: HistoricalEntity[];
  lang: Language;
  onSelect: (entity: HistoricalEntity) => void;
  selectedId: string | null;
  viewport: ViewportState;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
  isDevMode: boolean;
  onUpdateEntity: (e: HistoricalEntity) => void;
  onCreateEntity: (year: number) => void;
  onCreateEntityFromUrl: (url: string, year: number) => void;
  onDeleteEntity: (id: string) => void;
  onRegionLayoutCalc: (regions: RegionInfo[]) => void;
}

type DragMode = 'none' | 'pan' | 'move-item' | 'resize-left' | 'resize-right';

const TimelineBoard: React.FC<TimelineBoardProps> = ({ 
  data, 
  lang, 
  onSelect, 
  selectedId,
  viewport,
  setViewport,
  isDevMode,
  onUpdateEntity,
  onCreateEntity,
  onCreateEntityFromUrl,
  onDeleteEntity,
  onRegionLayoutCalc
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);       // Background Grid & Regions (z-0)
  const headerCanvasRef = useRef<HTMLCanvasElement>(null); // Dates Strip (z-20)
  
  // Layout Calculation
  const { itemMap, regions } = useMemo(() => calculateLayout(data), [data]);

  // Report regions up to parent for Sidebar
  useEffect(() => {
    onRegionLayoutCalc(regions);
  }, [regions, onRegionLayoutCalc]);

  // Interaction State
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const dragStartRef = useRef<{ 
      mouseX: number; 
      mouseY: number; 
      viewX: number; 
      viewY: number;
      itemStartYear?: number;
      itemEndYear?: number;
  } | null>(null);

  const isDragOccurred = useRef(false);
  
  const [dragItem, setDragItem] = useState<HistoricalEntity | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Context Menu & Search State
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, year: number} | null>(null);
  const [urlInput, setUrlInput] = useState(''); 
  const [searchQuery, setSearchQuery] = useState(''); 

  // Increased header offset to accommodate the date strip
  const headerOffset = 60; 
  
  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close context menu on global click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('#context-menu')) {
            setContextMenu(null);
            setUrlInput('');
            setSearchQuery('');
        }
    };
    window.addEventListener('mousedown', handleClick); 
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  // --- Search Logic ---
  const searchResults = useMemo(() => {
      if (!searchQuery.trim()) return [];
      const lowerQuery = searchQuery.toLowerCase();
      return data.filter(item => 
          item.name[lang].toLowerCase().includes(lowerQuery)
      ).slice(0, 8); 
  }, [data, searchQuery, lang]);

  const handleZoomToEntity = (entity: HistoricalEntity) => {
      const layoutItem = itemMap.get(entity.id);
      if (!layoutItem) return;

      const duration = Math.max(1, entity.endYear - entity.startYear);
      // Zoom to ALMOST full width of the container (90% to leave padding)
      const targetPixels = containerSize.width * 0.9; 
      let targetScale = targetPixels / duration;
      targetScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetScale));
      
      const entityCenterYear = entity.startYear + (duration / 2);
      const screenCenterX = containerSize.width / 2;
      const newOffsetX = screenCenterX - (entityCenterYear - MIN_YEAR) * targetScale;
      
      // Vertical Positioning: Put the item at the TOP (below header) so DetailPanel doesn't cover it
      // Target Y on screen (e.g. 70px from top)
      const TARGET_SCREEN_Y = 70; 
      // Current formula: RenderY = layoutItem.globalY + headerOffset + offsetY
      // We want: TARGET_SCREEN_Y = layoutItem.globalY + headerOffset + newOffsetY
      // Therefore: newOffsetY = TARGET_SCREEN_Y - layoutItem.globalY - headerOffset
      let newOffsetY = TARGET_SCREEN_Y - layoutItem.globalY - headerOffset;
      
      // Clamp Y to prevent showing empty space above top (optional, but good for UX if scrolling up)
      if (newOffsetY > 0) newOffsetY = 0;

      setViewport({
          scale: targetScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY
      });

      onSelect(entity);
      setContextMenu(null);
      setSearchQuery('');
  };

  // --- Canvas Rendering ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const headerCanvas = headerCanvasRef.current;
    if (!canvas || !headerCanvas || containerSize.width === 0) return;

    const ctx = canvas.getContext('2d');
    const headerCtx = headerCanvas.getContext('2d');
    if (!ctx || !headerCtx) return;

    const dpr = window.devicePixelRatio || 1;
    
    // Set up Main Canvas
    canvas.width = containerSize.width * dpr;
    canvas.height = containerSize.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${containerSize.width}px`;
    canvas.style.height = `${containerSize.height}px`;
    ctx.clearRect(0, 0, containerSize.width, containerSize.height);

    // Set up Header Canvas
    headerCanvas.width = containerSize.width * dpr;
    headerCanvas.height = 50 * dpr; // Fixed height for header strip
    headerCtx.scale(dpr, dpr);
    headerCanvas.style.width = `${containerSize.width}px`;
    headerCanvas.style.height = `50px`;
    headerCtx.clearRect(0, 0, containerSize.width, 50);

    // Draw Header Background (Opaque strip)
    headerCtx.fillStyle = '#1c1917'; // Match bg-paper
    headerCtx.fillRect(0, 0, containerSize.width, 50);
    headerCtx.fillStyle = '#1c1917'; // Second pass to ensure opacity
    headerCtx.fillRect(0, 0, containerSize.width, 50);
    
    // Header Border
    headerCtx.strokeStyle = '#44403c'; // stone-700
    headerCtx.lineWidth = 1;
    headerCtx.beginPath();
    headerCtx.moveTo(0, 49.5);
    headerCtx.lineTo(containerSize.width, 49.5);
    headerCtx.stroke();

    const { scale, offsetX, offsetY } = viewport;

    // 1. Draw Region Backgrounds & Separators (Main Canvas)
    regions.forEach(region => {
        const y = region.startY + offsetY + headerOffset;
        
        // Background tint
        ctx.fillStyle = region.color + '08'; // Extremely low opacity hex
        ctx.fillRect(0, y, containerSize.width, region.height);

        // Top border
        ctx.strokeStyle = region.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(containerSize.width, y);
        ctx.stroke();

        // Selection Border
        if (selectedRegion === region.name) {
            ctx.strokeStyle = '#d4af37'; // Gold
            ctx.lineWidth = 2;
            ctx.strokeRect(2, y + 2, containerSize.width - 4, region.height - 4);
        }

        // Label (Smaller, Top-Left)
        ctx.save();
        ctx.fillStyle = region.color;
        ctx.globalAlpha = 0.8;
        ctx.font = 'bold 16px Cinzel';
        ctx.textBaseline = 'top';
        const label = lang === 'en' ? region.name.toUpperCase() : region.name.toUpperCase();
        ctx.fillText(label, 20, y + 10);
        ctx.restore();
    });


    // 2. Draw Vertical Time Grid & Header Labels
    // Grid Lines on Main Canvas
    ctx.strokeStyle = 'rgba(214, 211, 209, 0.25)'; 
    ctx.lineWidth = 1;
    
    // Text on Header Canvas
    headerCtx.fillStyle = '#d4af37'; // Solid Gold
    headerCtx.font = 'bold 14px Cinzel';
    headerCtx.textAlign = 'center';
    headerCtx.textBaseline = 'middle';
    headerCtx.shadowColor = 'rgba(0,0,0,0.8)';
    headerCtx.shadowBlur = 4;

    const MIN_PX_BETWEEN_LINES = 160; 
    const minYearStep = MIN_PX_BETWEEN_LINES / scale;
    const allowedSteps = [
      1, 5, 10, 25, 50, 100, 250, 500, 1000, 
      2500, 5000, 10000, 25000, 50000, 100000, 
      250000, 500000, 1000000, 2500000, 5000000
    ];
    let yearStep = allowedSteps.find(s => s >= minYearStep) || 5000000;

    const startYear = Math.floor((-offsetX) / scale) + MIN_YEAR;
    const endYear = startYear + (containerSize.width / scale);
    const firstStep = Math.floor(startYear / yearStep) * yearStep;

    for (let year = firstStep; year <= endYear; year += yearStep) {
      const x = (year - MIN_YEAR) * scale + offsetX;
      if (x < -100 || x > containerSize.width + 100) continue;

      // Draw Grid Line on Main Canvas
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, containerSize.height);
      ctx.stroke();

      // Draw Label and Tick on Header Canvas
      const label = formatYearSmart(year);
      
      // Tick
      headerCtx.strokeStyle = '#57534e';
      headerCtx.beginPath();
      headerCtx.moveTo(x, 35);
      headerCtx.lineTo(x, 50);
      headerCtx.stroke();
      
      // Text
      headerCtx.fillText(label, x, 25); 
    }

  }, [viewport, containerSize, lang, regions, selectedRegion]);


  // --- Event Handlers ---

  const handleWheel = useCallback((e: React.WheelEvent) => {
    setViewport(prev => {
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const zoomFactor = 1 + delta;
      
      let newScale = prev.scale * zoomFactor;
      newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

      const rect = containerRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const worldX = (mouseX - prev.offsetX) / prev.scale;
      const newOffsetX = mouseX - (worldX * newScale);

      return { ...prev, scale: newScale, offsetX: newOffsetX };
    });
  }, [setViewport]);

  const handleMouseDownBoard = (e: React.MouseEvent) => {
    if (e.button === 2) return; 
    setDragMode('pan');
    isDragOccurred.current = false;
    
    // Save absolute start state
    dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        viewX: viewport.offsetX,
        viewY: viewport.offsetY
    };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      if (!isDragOccurred.current && dragMode === 'pan') {
          // It was a click, not a drag. Check for Region Selection.
          const rect = containerRef.current!.getBoundingClientRect();
          const clickY = e.clientY - rect.top - viewport.offsetY - headerOffset;
          
          let clickedRegion = null;
          for (const region of regions) {
              if (clickY >= region.startY && clickY <= region.startY + region.height) {
                  clickedRegion = region.name;
                  break;
              }
          }
          setSelectedRegion(clickedRegion);
      }

      setDragMode('none');
      setDragItem(null);
      dragStartRef.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      
      const rect = containerRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const year = (mouseX - viewport.offsetX) / viewport.scale + MIN_YEAR;
      
      setContextMenu({
          x: e.clientX,
          y: e.clientY,
          year
      });
      setUrlInput('');
      setSearchQuery('');
  };

  const handleUrlSubmit = () => {
      if (contextMenu && urlInput.trim()) {
          onCreateEntityFromUrl(urlInput.trim(), contextMenu.year);
          setContextMenu(null);
          setUrlInput('');
      }
  };

  const handleMouseDownItem = (e: React.MouseEvent, item: HistoricalEntity) => {
    e.stopPropagation(); 
    isDragOccurred.current = false;
    
    if (isDevMode && e.button === 0) { 
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        
        if (x < 15) {
            setDragMode('resize-left');
        } else if (x > width - 15) {
            setDragMode('resize-right');
        } else {
            setDragMode('move-item');
        }
        setDragItem(item);
        
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            viewX: 0, 
            viewY: 0,
            itemStartYear: item.startYear,
            itemEndYear: item.endYear
        };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
     const startState = dragStartRef.current;
     if (!startState) return;

     const dx = e.clientX - startState.mouseX;
     const dy = e.clientY - startState.mouseY;
     
     if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
         isDragOccurred.current = true;
     }

     if (dragMode === 'pan') {
        let newOffsetY = startState.viewY + dy;
        
        // RESTRICTION: Do not allow dragging the board down past the top (0)
        // This ensures the first group stays at the top or moves up, but never reveals empty space above.
        if (newOffsetY > 0) {
            newOffsetY = 0;
        }

        setViewport(prev => ({
            ...prev,
            offsetX: startState.viewX + dx,
            offsetY: newOffsetY
        }));
     }
     else if (isDevMode && dragItem && dragMode !== 'none') {
        const newItem = { ...dragItem };
        const totalYearDelta = dx / viewport.scale;

        if (startState.itemStartYear !== undefined && startState.itemEndYear !== undefined) {
             if (dragMode === 'move-item') {
                newItem.startYear = startState.itemStartYear + totalYearDelta;
                newItem.endYear = startState.itemEndYear + totalYearDelta;
            } else if (dragMode === 'resize-left') {
                newItem.startYear = startState.itemStartYear + totalYearDelta;
            } else if (dragMode === 'resize-right') {
                newItem.endYear = startState.itemEndYear + totalYearDelta;
            }

            onUpdateEntity(newItem);
            setDragItem(newItem);
        }
     }
  };


  // --- DOM Overlays for Items ---
  const visibleItems = useMemo(() => {
    const { scale, offsetX, offsetY } = viewport;
    const visibleStartYear = (-offsetX / scale) + MIN_YEAR;
    const visibleEndYear = visibleStartYear + (containerSize.width / scale);
    const dynamicBuffer = Math.max(500, 100/scale); 

    const res: Array<React.ReactNode> = [];

    itemMap.forEach((layout, id) => {
        const item = layout.entity;
        
        // Visibility Check
        if (item.endYear < visibleStartYear - dynamicBuffer || item.startYear > visibleEndYear + dynamicBuffer) return;
        
        const y = layout.globalY + headerOffset + offsetY;
        if (y < -50 || y > containerSize.height + 50) return;

        const x = (item.startYear - MIN_YEAR) * viewport.scale + viewport.offsetX;
        const width = Math.max(2, (item.endYear - item.startYear) * viewport.scale);
        
        const isSelected = selectedId === item.id;

        let bgColor = 'bg-stone-600';
        let borderColor = 'border-stone-500';
        
        if (item.type === 'civilization') { bgColor = 'bg-amber-800'; borderColor = 'border-amber-600'; }
        if (item.type === 'state') { bgColor = 'bg-red-900'; borderColor = 'border-red-700'; }
        if (item.type === 'culture') { bgColor = 'bg-emerald-900'; borderColor = 'border-emerald-700'; }
        if (item.type === 'empire') { bgColor = 'bg-purple-900'; borderColor = 'border-purple-700'; }
        if (item.type === 'kingdom') { bgColor = 'bg-blue-900'; borderColor = 'border-blue-700'; }

        if (isSelected) { bgColor = 'bg-gold'; borderColor = 'border-white'; }

        res.push(
            <React.Fragment key={item.id}>
              <div
                onMouseDown={(e) => handleMouseDownItem(e, item)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDragOccurred.current) handleZoomToEntity(item);
                }}
                className={`absolute h-10 rounded-md border shadow-lg flex items-center px-2 
                  transition-colors duration-200 pointer-events-auto group
                  ${bgColor} ${borderColor} 
                  ${isSelected ? 'text-black font-bold ring-4 ring-white/20 z-[60] scale-105 shadow-gold/20' : 'text-stone-200 z-10 opacity-90'}
                  ${isDevMode ? 'hover:cursor-move' : 'hover:cursor-pointer hover:brightness-125'}
                `}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${width}px`,
                  minWidth: '50px',
                  maxWidth: '10000px',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
                title={`${item.name[lang]} (${formatYearSmart(item.startYear)} - ${formatYearSmart(item.endYear)})`}
              >
                {/* Resize Handles */}
                {isDevMode && isSelected && (
                    <>
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white/50 cursor-w-resize rounded-l-md" />
                        <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white/50 cursor-e-resize rounded-r-md" />
                        <button 
                            onMouseDown={(e) => e.stopPropagation()} // Fix: Stop drag event when clicking delete
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this card?')) onDeleteEntity(item.id);
                            }}
                            className="absolute -top-3 -right-3 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs border border-white hover:bg-red-700 shadow-md z-50 cursor-pointer"
                        >
                            ✕
                        </button>
                    </>
                )}

                <span className="truncate text-xs font-serif whitespace-nowrap overflow-hidden w-full text-center">
                  {item.name[lang]}
                </span>
              </div>
              
              {isSelected && item.events && (() => {
                 const sortedEvents = [...item.events].sort((a, b) => a.year - b.year);
                 const levels: number[] = [];
                 const MIN_DIST = 160; 

                 return sortedEvents.map((evt, idx) => {
                    const evtX = (evt.year - MIN_YEAR) * viewport.scale + viewport.offsetX;
                    if (evtX < -500 || evtX > containerSize.width + 500) return null;

                    let level = 0;
                    while (true) {
                        const lastX = levels[level] !== undefined ? levels[level] : -Infinity;
                        if (evtX >= lastX + MIN_DIST) {
                            levels[level] = evtX;
                            break;
                        }
                        level++;
                    }

                    const yOffset = 50 + (level * 60); // Pushed down slightly
                    const titleText = evt.title ? evt.title[lang] : evt.description[lang].split('.')[0].substring(0, 30) + '...';

                    return (
                       <div 
                        key={idx}
                        className="absolute z-[70] group flex flex-col items-center"
                        style={{ left: `${evtX}px`, top: `${y + yOffset}px`, transform: 'translateX(-50%)' }} 
                       >
                         <div className="absolute bg-gold/50 w-0.5" style={{ height: `${yOffset}px`, bottom: '50%', left: '50%', transform: 'translateY(-6px)' }} />
                         <div className="w-4 h-4 bg-gold rounded-full border-2 border-black shadow-md hover:scale-150 transition-transform cursor-pointer relative z-10" />
                         <div className="mt-1 text-xs text-gold font-serif whitespace-nowrap bg-black/80 px-2 py-0.5 rounded backdrop-blur-sm border border-stone-600 shadow-lg">
                            {titleText}
                         </div>
                         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 bg-black/95 text-white text-xs p-3 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal z-[80] border border-gold/30 shadow-2xl">
                            <span className="font-bold block text-gold mb-1 border-b border-stone-700 pb-1">{formatYearSmart(evt.year)}</span>
                            {evt.description[lang]}
                         </div>
                       </div>
                    );
                 });
              })()}
            </React.Fragment>
        );
    });
    return res;
  }, [itemMap, viewport, containerSize, selectedId, lang, isDevMode]);

  // Calculate zoom percentage
  const zoomPercentage = useMemo(() => {
    const logScale = Math.log(viewport.scale);
    const logMin = Math.log(MIN_ZOOM);
    const logMax = Math.log(MAX_ZOOM);
    const percent = ((logScale - logMin) / (logMax - logMin)) * 100;
    return Math.max(0, Math.min(100, percent)).toFixed(0) + '%';
  }, [viewport.scale]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none bg-paper ${dragMode === 'pan' ? 'cursor-grabbing' : 'cursor-grab'}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDownBoard}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Header Canvas (Date Strip) - z-20 (above items) */}
      <canvas ref={headerCanvasRef} className="absolute top-0 left-0 w-full h-[50px] pointer-events-none z-20 shadow-xl" />

      {/* Main Background Canvas - z-0 */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />
      
      {/* Items Overlay - z-10 */}
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
         {visibleItems}
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
          <div 
            id="context-menu"
            onWheel={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
            className="fixed bg-stone-800 border border-stone-600 text-stone-200 rounded shadow-xl z-50 py-1 min-w-[240px] overflow-hidden"
            style={{ left: Math.min(contextMenu.x, window.innerWidth - 240), top: Math.min(contextMenu.y, window.innerHeight - 300) }}
          >
              <div className="bg-stone-900 border-b border-stone-700 p-2">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder={lang === 'en' ? "Search..." : "Поиск..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-sm text-white focus:border-gold outline-none placeholder-stone-500"
                  />
              </div>

               {/* Search Results List */}
               <div className="max-h-64 overflow-y-auto">
                {searchResults.map(result => (
                    <button
                        key={result.id}
                        onClick={() => handleZoomToEntity(result)}
                        className="w-full text-left px-3 py-2 hover:bg-stone-700 text-sm border-b border-stone-700/50 last:border-0 block"
                    >
                        <div className="font-bold text-gold">{result.name[lang]}</div>
                        <div className="text-[10px] text-stone-400">
                            {formatYearSmart(result.startYear)} — {formatYearSmart(result.endYear)}
                        </div>
                    </button>
                ))}
                {searchQuery && searchResults.length === 0 && (
                    <div className="px-3 py-2 text-xs text-stone-500 text-center italic">
                        {lang === 'en' ? 'No results found' : 'Ничего не найдено'}
                    </div>
                )}
              </div>

              {/* Results & Dev Tools */}
               {isDevMode && (
                  <button 
                        className="w-full text-left px-3 py-2 hover:bg-stone-700 text-sm flex items-center gap-2 text-stone-300"
                        onClick={() => {
                            onCreateEntity(contextMenu.year);
                            setContextMenu(null);
                        }}
                    >
                        <span className="text-green-500 font-bold">+</span> Create
                    </button>
               )}
          </div>
      )}

      <div className="absolute bottom-6 right-6 bg-paper-light border border-stone-600 text-stone-300 px-3 py-1 rounded text-sm font-mono z-50 shadow-xl opacity-80 pointer-events-none min-w-[60px] text-center">
        {zoomPercentage}
      </div>
    </div>
  );
};

export default TimelineBoard;