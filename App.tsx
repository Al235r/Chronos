import React, { useState, useEffect, useCallback } from 'react';
import TimelineBoard from './components/TimelineBoard';
import DetailPanel from './components/DetailPanel';
import Sidebar from './components/Sidebar';
import { historicalData } from './data/historyData';
import { Language, ViewportState, HistoricalEntity, MIN_YEAR, MIN_ZOOM, MAX_ZOOM } from './types';
import { GoogleGenAI } from '@google/genai';
import { RegionInfo } from './utils/layout';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ru');
  const [data, setData] = useState<HistoricalEntity[]>(historicalData);
  const [selectedEntity, setSelectedEntity] = useState<HistoricalEntity | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  
  // Initial viewport state
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 0.0005, 
    offsetX: 0, 
    offsetY: 0
  });

  // Center the view initially
  useEffect(() => {
    const initialYear = -1500000;
    const initialScale = 0.0005; 
    
    setViewport({
      scale: initialScale,
      offsetX: (window.innerWidth / 2) - (initialYear - MIN_YEAR) * initialScale,
      offsetY: 0
    });
  }, []);

  const handleEntitySelect = useCallback((entity: HistoricalEntity) => {
    setSelectedEntity(entity);
  }, []);

  const handleUpdateEntity = (updatedEntity: HistoricalEntity) => {
    setData(prev => prev.map(item => item.id === updatedEntity.id ? updatedEntity : item));
    if (selectedEntity && selectedEntity.id === updatedEntity.id) {
        setSelectedEntity(updatedEntity);
    }
  };
  
  const handleDeleteEntity = (id: string) => {
      setData(prev => prev.filter(item => item.id !== id));
      if (selectedEntity && selectedEntity.id === id) {
          setSelectedEntity(null);
      }
  };

  const handleCreateEntity = (year: number) => {
      const newEntity: HistoricalEntity = {
          id: `new-${Date.now()}`,
          name: { en: 'New Entity', ru: 'Новый объект' },
          description: { en: 'Description...', ru: 'Описание...' },
          location: { en: 'Location', ru: 'Локация' },
          startYear: Math.floor(year),
          endYear: Math.floor(year + (100 / viewport.scale * 0.0005 * 2000)), 
          type: 'culture',
          events: []
      };
      
      if (newEntity.endYear - newEntity.startYear < 50) {
          newEntity.endYear = newEntity.startYear + 100;
      }

      setData(prev => [...prev, newEntity]);
      setSelectedEntity(newEntity);
  };
  
  const handleCreateEntityFromUrl = async (urlOrTopic: string, approxYear: number) => {
      setIsLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          const prompt = `
          Create a JSON object for a historical entity (civilization, culture, empire, event, etc.) based on the topic: "${urlOrTopic}".
          The "approxYear" where the user clicked is ${approxYear}, so try to find something relevant near that time if the topic is ambiguous, or just use the topic's actual historical dates.
          
          Return JSON matching this schema:
          {
            "name": { "en": "Name in English", "ru": "Name in Russian" },
            "description": { "en": "Short description (2-3 sentences)", "ru": "Краткое описание (2-3 предложения)" },
            "location": { "en": "Region name", "ru": "Название региона" },
            "startYear": number (negative for BC),
            "endYear": number (negative for BC),
            "type": "culture" | "civilization" | "state" | "empire" | "kingdom" | "period" | "event",
            "events": [
               { "year": number, "title": {"en": "string", "ru": "string"}, "description": {"en": "string", "ru": "string"} }
            ]
          }
          Only return the JSON.
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: {
                responseMimeType: 'application/json'
              }
          });
          
          const text = response.text;
          if (text) {
              const result = JSON.parse(text);
              const newEntity: HistoricalEntity = {
                  id: `ai-${Date.now()}`,
                  ...result,
                  lane: undefined 
              };
              
              setData(prev => [...prev, newEntity]);
              setSelectedEntity(newEntity);
              
              const targetWorldX = (newEntity.startYear - MIN_YEAR);
              const newOffsetX = (window.innerWidth / 2) - (targetWorldX * viewport.scale);
              setViewport(prev => ({
                  ...prev,
                  offsetX: newOffsetX
              }));
          } else {
             throw new Error("Empty response");
          }

      } catch (error) {
          console.error("AI Generation failed:", error);
          alert("AI Generation unavailable or failed. Creating empty card.");
          const newEntity: HistoricalEntity = {
            id: `manual-${Date.now()}`,
            name: { en: urlOrTopic, ru: urlOrTopic },
            description: { 
                en: 'Auto-created entry (AI failed). Edit details manually.', 
                ru: 'Автоматически созданная запись (сбой ИИ). Заполните детали вручную.' 
            },
            location: { en: 'Unknown', ru: 'Неизвестно' },
            startYear: Math.floor(approxYear),
            endYear: Math.floor(approxYear + 100),
            type: 'culture',
            events: []
        };
        setData(prev => [...prev, newEntity]);
        setSelectedEntity(newEntity);
      } finally {
          setIsLoading(false);
      }
  };

  const handleRegionScroll = (targetY: number) => {
      // Calculate center offset
      // We want targetY to be somewhat near top, but below header
      const newOffsetY = 100 - targetY;
      setViewport(prev => ({ ...prev, offsetY: newOffsetY }));
  };

  const handleSidebarEntitySelect = (entity: HistoricalEntity) => {
      // 1. Select
      setSelectedEntity(entity);
      
      // 2. Zoom/Pan to entity (Simulate behavior of clicking card as much as possible)
      // Note: We don't have exact Y from layout here without prop drilling layout map.
      // So we just handle horizontal zoom correctly.
      
      const duration = Math.max(1, entity.endYear - entity.startYear);
      // Zoom to ALMOST full width (90% to leave padding)
      const targetPixels = window.innerWidth * 0.9; 
      let targetScale = targetPixels / duration;
      targetScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetScale));
      
      const entityCenterYear = entity.startYear + (duration / 2);
      const screenCenterX = window.innerWidth / 2;
      const newOffsetX = screenCenterX - (entityCenterYear - MIN_YEAR) * targetScale;
      
      setViewport(prev => ({
          ...prev,
          scale: targetScale,
          offsetX: newOffsetX
      }));
  };

  return (
    <div className="relative w-screen h-screen bg-paper text-stone-200 overflow-hidden font-sans">
      <TimelineBoard 
        data={data}
        lang={lang}
        onSelect={handleEntitySelect}
        selectedId={selectedEntity?.id || null}
        viewport={viewport}
        setViewport={setViewport}
        isDevMode={isDevMode}
        onUpdateEntity={handleUpdateEntity}
        onCreateEntity={handleCreateEntity}
        onCreateEntityFromUrl={handleCreateEntityFromUrl}
        onDeleteEntity={handleDeleteEntity}
        onRegionLayoutCalc={setRegions}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center pointer-events-none">
            <div className="text-gold font-display text-2xl animate-pulse">Consulting the Archives...</div>
            <div className="text-stone-400 text-sm mt-2">Connecting to Neural History Grid</div>
        </div>
      )}

      <Sidebar 
         data={data}
         regions={regions} 
         lang={lang}
         setLang={setLang}
         isDevMode={isDevMode}
         setIsDevMode={setIsDevMode}
         onScrollToRegion={handleRegionScroll}
         onSelectEntity={handleSidebarEntitySelect}
      />

      <DetailPanel 
        entity={selectedEntity} 
        lang={lang} 
        onClose={() => setSelectedEntity(null)}
        isDevMode={isDevMode}
        onUpdateEntity={handleUpdateEntity}
      />
    </div>
  );
};

export default App;