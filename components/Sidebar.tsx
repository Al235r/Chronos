import React, { useState, useMemo } from 'react';
import { RegionInfo, getRegion, REGION_ORDER } from '../utils/layout';
import { Language, HistoricalEntity } from '../types';

interface SidebarProps {
  data: HistoricalEntity[];
  regions: RegionInfo[];
  onScrollToRegion: (y: number) => void;
  onSelectEntity: (entity: HistoricalEntity) => void;
  lang: Language;
  setLang: (l: Language) => void;
  isDevMode: boolean;
  setIsDevMode: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    data, 
    regions, 
    onScrollToRegion, 
    onSelectEntity, 
    lang, 
    setLang,
    isDevMode,
    setIsDevMode
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(REGION_ORDER));
    const [showSettings, setShowSettings] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Group entities by region for the sidebar list
    const groupedEntities = useMemo(() => {
        const groups: Record<string, HistoricalEntity[]> = {};
        REGION_ORDER.forEach(r => groups[r] = []);
        
        data.forEach(item => {
            const region = getRegion(item.location);
            if (groups[region]) {
                groups[region].push(item);
            } else if (groups['Global / Eurasia']) {
                groups['Global / Eurasia'].push(item);
            }
        });
        
        // Sort entities by start year
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => a.startYear - b.startYear);
        });
        
        return groups;
    }, [data]);

    const toggleRegion = (regionName: string) => {
        const newSet = new Set(expandedRegions);
        if (newSet.has(regionName)) {
            newSet.delete(regionName);
        } else {
            newSet.add(regionName);
        }
        setExpandedRegions(newSet);
    };

    return (
        <div 
            className={`absolute left-0 top-0 bottom-0 z-[100] transition-all duration-300 ease-in-out flex pointer-events-none ${isOpen ? 'w-72' : 'w-10'}`}
        >
            {/* The Panel */}
            <div className={`h-full bg-paper/95 backdrop-blur-md border-r border-stone-700 flex flex-col pointer-events-auto overflow-hidden transition-all duration-300 shadow-2xl ${isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'}`}>
                
                {/* Header with Title */}
                <div className="p-6 border-b border-stone-700 bg-black/20 shrink-0">
                    <h1 className="text-gold font-display text-3xl tracking-widest text-center drop-shadow-md mb-2">CHRONOS</h1>
                    <div className="h-0.5 w-12 bg-gold mx-auto opacity-50"></div>
                </div>
                
                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {regions.map((region) => {
                        const entities = groupedEntities[region.name] || [];
                        const isExpanded = expandedRegions.has(region.name);
                        
                        return (
                            <div key={region.name} className="mb-2">
                                {/* Region Header */}
                                <div className="flex items-center gap-2 group">
                                     <button 
                                        onClick={() => toggleRegion(region.name)}
                                        className="p-1 text-stone-500 hover:text-gold transition-colors"
                                     >
                                        <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                     </button>

                                    <button
                                        onClick={() => onScrollToRegion(region.startY)}
                                        className="flex-1 text-left p-2 rounded hover:bg-stone-800/50 border border-transparent hover:border-stone-700 transition-all flex items-center gap-2"
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: region.color }} />
                                        <span className="font-display text-stone-300 group-hover:text-gold text-sm font-bold tracking-wide uppercase">
                                            {lang === 'en' ? region.name : region.name === 'Middle East' ? 'Ближний Восток' : region.name === 'Americas' ? 'Америка' : region.name === 'Global / Eurasia' ? 'Евразия' : region.name === 'Europe' ? 'Европа' : region.name === 'Africa' ? 'Африка' : region.name === 'Asia' ? 'Азия' : region.name}
                                        </span>
                                    </button>
                                </div>

                                {/* Entities Sub-list */}
                                <div className={`ml-8 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="flex flex-col border-l border-stone-800 ml-1 pl-2 py-1 space-y-0.5">
                                        {entities.map(entity => (
                                            <button
                                                key={entity.id}
                                                onClick={() => onSelectEntity(entity)}
                                                className="text-left text-xs text-stone-500 hover:text-stone-200 hover:bg-stone-800/50 py-1.5 px-2 rounded transition-colors truncate font-serif"
                                                title={entity.name[lang]}
                                            >
                                                {entity.name[lang]}
                                            </button>
                                        ))}
                                        {entities.length === 0 && (
                                            <span className="text-[10px] text-stone-700 italic pl-2">Empty</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Footer Controls */}
                <div className="p-4 border-t border-stone-700 bg-black/30 shrink-0 flex flex-col gap-3">
                    
                    {/* Settings Panel (Expandable) */}
                    {showSettings && (
                        <div className="bg-stone-800/80 p-3 rounded-lg border border-stone-700 space-y-3 mb-1 animate-pulse-once">
                            {/* Language Toggle */}
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Language</span>
                               <div className="flex bg-stone-900 rounded p-0.5 border border-stone-700">
                                  <button 
                                    onClick={() => setLang('en')} 
                                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${lang === 'en' ? 'bg-stone-700 text-gold font-bold' : 'text-stone-500 hover:text-stone-300'}`}
                                  >
                                    EN
                                  </button>
                                  <button 
                                    onClick={() => setLang('ru')} 
                                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${lang === 'ru' ? 'bg-stone-700 text-gold font-bold' : 'text-stone-500 hover:text-stone-300'}`}
                                  >
                                    RU
                                  </button>
                               </div>
                            </div>

                            {/* Dev Mode Toggle */}
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Dev Mode</span>
                               <button 
                                   onClick={() => setIsDevMode(!isDevMode)}
                                   className={`w-8 h-4 rounded-full relative transition-colors ${isDevMode ? 'bg-green-600' : 'bg-stone-600'}`}
                               >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isDevMode ? 'left-4.5 translate-x-0' : 'left-0.5'}`} style={{ left: isDevMode ? 'calc(100% - 14px)' : '2px' }} />
                               </button>
                            </div>
                        </div>
                    )}

                    {/* Bottom Icons Row */}
                    <div className="flex items-center justify-between px-2">
                        {/* Settings Button */}
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-full transition-colors ${showSettings ? 'text-gold bg-stone-800' : 'text-stone-500 hover:text-stone-300'}`}
                            title={lang === 'en' ? "Settings" : "Настройки"}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* Login Button */}
                        <button 
                            onClick={() => setIsLoggedIn(!isLoggedIn)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95
                              ${isLoggedIn ? 'bg-transparent border-gold' : 'bg-white border-transparent'}
                            `}
                            title={isLoggedIn ? 'Profile' : 'Sign in'}
                        >
                             {isLoggedIn ? (
                               <img 
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                                alt="Avatar" 
                                className="w-full h-full rounded-full"
                               />
                             ) : (
                               <svg className="w-4 h-4" viewBox="0 0 24 24">
                                 <path
                                  fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                               </svg>
                             )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Handle */}
            <div className="h-full flex flex-col justify-center pointer-events-auto">
                 <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-paper border-y border-r border-stone-700 rounded-r-lg py-4 px-1 text-stone-500 hover:text-gold shadow-xl flex items-center justify-center"
                 >
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                 </button>
            </div>
        </div>
    );
};

export default Sidebar;