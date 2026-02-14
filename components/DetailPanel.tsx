import React, { useState, useEffect, useRef } from 'react';
import { HistoricalEntity, Language, SubEvent, EntityType } from '../types';
import { formatYearSmart } from '../utils/formatting';
import { GoogleGenAI } from '@google/genai';

interface DetailPanelProps {
  entity: HistoricalEntity | null;
  lang: Language;
  onClose: () => void;
  isDevMode: boolean;
  onUpdateEntity: (e: HistoricalEntity) => void;
}

// Helpers for Date Editing
type DateEra = 'AD' | 'BC' | 'Ma' | 'ka';

const parseYearToParts = (rawYear: number): { value: number, era: DateEra } => {
    const abs = Math.abs(rawYear);
    if (abs >= 1000000) return { value: parseFloat((abs / 1000000).toFixed(4)), era: 'Ma' };
    if (abs >= 10000 && rawYear < 0) return { value: parseFloat((abs / 1000).toFixed(2)), era: 'ka' };
    if (rawYear < 0) return { value: abs, era: 'BC' };
    return { value: abs, era: 'AD' };
};

const partsToYear = (value: number, era: DateEra): number => {
    if (era === 'Ma') return -value * 1000000;
    if (era === 'ka') return -value * 1000;
    if (era === 'BC') return -value;
    return value;
};

const DateEditor: React.FC<{ 
    rawYear: number, 
    onChange: (val: number) => void,
    className?: string
}> = ({ rawYear, onChange, className }) => {
    const [parts, setParts] = useState(parseYearToParts(rawYear));

    useEffect(() => {
        setParts(parseYearToParts(rawYear));
    }, [rawYear]);

    const handleValueChange = (val: number) => {
        const newParts = { ...parts, value: val };
        setParts(newParts);
        onChange(partsToYear(newParts.value, newParts.era));
    };

    const handleEraChange = (era: DateEra) => {
        const newParts = { ...parts, era };
        setParts(newParts);
        onChange(partsToYear(newParts.value, newParts.era));
    };

    return (
        <div className={`flex gap-1 items-center ${className}`}>
            <input 
                type="number" 
                value={parts.value} 
                onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
                className="w-20 bg-stone-800 border border-stone-600 rounded px-1 text-xs text-white focus:border-gold outline-none"
            />
            <select 
                value={parts.era} 
                onChange={(e) => handleEraChange(e.target.value as DateEra)}
                className="bg-stone-800 border border-stone-600 rounded px-1 text-xs text-gold focus:border-gold outline-none"
            >
                <option value="AD">AD</option>
                <option value="BC">BC</option>
                <option value="ka">ka</option>
                <option value="Ma">Ma</option>
            </select>
        </div>
    );
};

// Helper to render description with bold text support (**text**)
const renderFormattedText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} className="mb-1"/>;
        
        // Check if line is a bullet point
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
        
        const parts = line.split('**');
        return (
            <p key={i} className={`mb-3 text-stone-300 leading-7 text-base text-left ${isBullet ? 'pl-4' : ''}`}>
                {parts.map((part, index) => {
                    // Odd indices are inside **bold** markers
                    return index % 2 === 1 ? (
                        <strong key={index} className="text-gold font-bold block mt-4 mb-2 text-lg border-b border-stone-700/50 pb-1 w-full">
                            {part}
                        </strong>
                    ) : (
                        part
                    );
                })}
            </p>
        );
    });
};

const ENTITY_TYPES: EntityType[] = ['culture', 'civilization', 'state', 'empire', 'kingdom', 'period', 'event'];

const DetailPanel: React.FC<DetailPanelProps> = ({ entity, lang, onClose, isDevMode, onUpdateEntity }) => {
  const [height, setHeight] = useState(60); 
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<HistoricalEntity | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'model', text: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (entity) {
      setHeight(60); 
      setEditForm({ ...entity });
      setIsEditing(false);
      setActiveTab('info');
      setChatMessages([{
          role: 'model', 
          text: lang === 'en' 
            ? `I am ready to discuss the history of ${entity.name.en}. Ask me anything.` 
            : `Я готов обсудить историю ${entity.name.ru}. Спрашивайте.`
      }]);
    }
  }, [entity]); 

  // Handle Resize Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startYRef.current - e.clientY;
      const newHeightPx = startHeightRef.current + deltaY;
      const newHeightVh = (newHeightPx / window.innerHeight) * 100;
      const clamped = Math.min(Math.max(newHeightVh, 20), 98);
      setHeight(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = (height / 100) * window.innerHeight;
  };

  // --- AI Handlers ---
  const handleAiGenerateDescription = async () => {
      if (!editForm) return;
      setIsGenerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          const languageName = lang === 'en' ? 'English' : 'Russian';
          const prompt = `
            Write a structured historical description for "${editForm.name.en}" (Type: ${editForm.type}) in ${languageName}.
            
            Follow this strict structure:
            1. **Introduction**: Brief overview, dates, location.
            2. **Major Characteristics and Achievements**: List 3-4 key points (technology, art, social structure). Use bullet points.
            3. **Context or Hypotheses**: Any specific theories (like Solutrean hypothesis if applicable) or historical context.
            4. **Legacy/Continuity**: What came before and what followed.

            IMPORTANT FORMATTING RULES:
            - Use double asterisks **Title** for section headers.
            - Do NOT use Markdown headers (# or ##).
            - Separate paragraphs with newlines.
            
            Start Year: ${editForm.startYear}, End Year: ${editForm.endYear}.
          `;
          
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt
          });
          
          const text = response.text;
          handleInputChange('description', text, lang);
      } catch (e) {
          console.error(e);
          alert('AI Generation failed');
      } finally {
          setIsGenerating(false);
      }
  };

  const handleAiGenerateEvents = async () => {
      if (!editForm) return;
      setIsGenerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `List 3 to 5 major historical events for "${editForm.name.en}" between year ${editForm.startYear} and ${editForm.endYear}.
          Return strictly a JSON array of objects.
          Schema: { "year": number, "title": { "en": "string", "ru": "string" }, "description": { "en": "string", "ru": "string" } }
          Only return valid JSON.`;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          });
          
          const newEvents = JSON.parse(response.text);
          setEditForm(prev => prev ? ({
              ...prev,
              events: [...(prev.events || []), ...newEvents]
          }) : null);
      } catch (e) {
           console.error(e);
           alert('AI Event Generation failed');
      } finally {
          setIsGenerating(false);
      }
  };


  // --- Chat Handlers ---
  const handleSendMessage = async () => {
      if (!chatInput.trim() || !entity) return;
      
      const userMsg = chatInput;
      // Optimistic Update
      const newMessages = [...chatMessages, { role: 'user' as const, text: userMsg }];
      setChatMessages(newMessages);
      setChatInput('');
      setIsChatLoading(true);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const context = `
            You are an expert historian. 
            The user is asking about: "${entity.name[lang]}".
            Context Description: ${entity.description[lang]}.
            Dates: ${formatYearSmart(entity.startYear)} - ${formatYearSmart(entity.endYear)}.
            Current Language: ${lang === 'en' ? 'English' : 'Russian'}.
            Keep answers concise and relevant to the historical entity.
          `;
          
          // Use new SDK Chat API
          const chat = ai.chats.create({
              model: 'gemini-3-flash-preview',
              config: {
                systemInstruction: context,
              },
              history: newMessages.map(m => ({
                  role: m.role,
                  parts: [{ text: m.text }]
              }))
          });

          // In new SDK, we send the last message
          const result = await chat.sendMessage({ message: userMsg });
          const responseText = result.text;
          
          if (responseText) {
              setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
          } else {
             throw new Error("Empty response");
          }

      } catch (error) {
          console.error("Chat error:", error);
          setChatMessages(prev => [...prev, { role: 'model', text: lang === 'en' ? "Error connecting to historian AI." : "Ошибка подключения к ИИ историку." }]);
      } finally {
          setIsChatLoading(false);
      }
  };

  // --- Form Editing Handlers ---

  const handleInputChange = (field: keyof HistoricalEntity, value: any, nestedKey?: 'en' | 'ru') => {
      if (!editForm) return;
      let updated = { ...editForm };
      if (field === 'name' || field === 'description' || field === 'location') {
          if (nestedKey) updated[field] = { ...updated[field], [nestedKey]: value };
      } else {
          updated = { ...updated, [field]: value };
      }
      setEditForm(updated);
  };

  const handleEventChange = (index: number, field: keyof SubEvent | 'title_val' | 'desc_val', value: any, langKey: 'en' | 'ru' = lang) => {
      if (!editForm || !editForm.events) return;
      const newEvents = [...editForm.events];
      const eventToUpdate = { ...newEvents[index] };

      if (field === 'year') {
          eventToUpdate.year = value;
      } else if (field === 'title_val') {
          eventToUpdate.title = { ...eventToUpdate.title || { en: '', ru: '' }, [langKey]: value };
      } else if (field === 'desc_val') {
          eventToUpdate.description = { ...eventToUpdate.description, [langKey]: value };
      }

      newEvents[index] = eventToUpdate;
      setEditForm({ ...editForm, events: newEvents });
  };

  const handleAddEvent = () => {
      if (!editForm) return;
      const newEvent: SubEvent = {
          year: editForm.startYear,
          title: { en: 'New Event', ru: 'Новое событие' },
          description: { en: 'Description', ru: 'Описание' }
      };
      setEditForm({ ...editForm, events: [...(editForm.events || []), newEvent] });
  };

  const handleDeleteEvent = (index: number) => {
      if (!editForm || !editForm.events) return;
      const newEvents = [...editForm.events];
      newEvents.splice(index, 1);
      setEditForm({ ...editForm, events: newEvents });
  };
  
  const handleSaveAndExit = () => {
      if (!editForm) return;
      onUpdateEntity(editForm);
      setIsEditing(false);
  };
  
  const handleCancel = () => {
      if (entity) {
          setEditForm({ ...entity });
          setIsEditing(false);
      }
  };


  if (!entity || !editForm) return null;

  return (
    <div 
      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/2 bg-paper-light/95 backdrop-blur-md border border-gold-dim/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 rounded-t-2xl transition-all duration-75 ease-out flex flex-col overflow-hidden"
      style={{ height: `${height}vh` }}
    >
      {/* Resize Handle */}
      <div 
        className="w-full h-6 bg-transparent hover:bg-stone-800/30 absolute top-0 left-0 cursor-row-resize flex items-center justify-center z-50 group transition-colors"
        onMouseDown={startDrag}
      >
        <div className="w-16 h-1.5 bg-stone-600 rounded-full group-hover:bg-gold transition-colors" />
      </div>

      <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white z-50 bg-black/20 p-1 rounded-full hover:bg-black/50 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex h-full pt-6">
        {/* Left Side: Header & Main Info */}
        <div className="w-1/2 p-8 pt-2 border-r border-stone-700/50 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex-1">
            
            {/* Top Toolbar */}
            <div className="flex justify-between items-center mb-2 h-8">
                {isEditing ? (
                    <select 
                        value={editForm.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="bg-stone-800 border border-stone-600 rounded px-2 py-0.5 text-xs font-bold uppercase text-gold focus:border-gold outline-none"
                    >
                        {ENTITY_TYPES.map(t => (
                            <option key={t} value={t}>{t.toUpperCase()}</option>
                        ))}
                    </select>
                ) : (
                    <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-black bg-gold rounded-sm">
                        {entity.type.toUpperCase()}
                    </span>
                )}
                
                {isDevMode && !isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="text-stone-400 hover:text-gold flex items-center gap-1 text-xs uppercase font-bold"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {lang === 'en' ? 'Edit' : 'Ред.'}
                    </button>
                )}
                
                {isEditing && (
                     <div className="flex gap-2">
                         <button onClick={handleCancel} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase">
                             {lang === 'en' ? 'Cancel' : 'Отмена'}
                         </button>
                         <button onClick={handleSaveAndExit} className="text-green-400 hover:text-green-300 text-xs font-bold uppercase bg-green-900/30 px-2 py-0.5 rounded border border-green-800">
                             {lang === 'en' ? 'Save & Exit' : 'Сохр.'}
                         </button>
                     </div>
                )}
            </div>
            
            {/* Title Area */}
            <div className="flex items-center gap-2 mb-2">
                {isEditing ? (
                    <input 
                        type="text" 
                        value={editForm.name[lang]} 
                        onChange={(e) => handleInputChange('name', e.target.value, lang)}
                        className="text-2xl font-serif font-bold text-gold bg-stone-800 border border-stone-600 rounded px-1 w-full focus:border-gold outline-none"
                    />
                ) : (
                    <h2 className="text-4xl font-serif font-bold text-gold leading-tight">
                        {entity.name[lang]}
                    </h2>
                )}
            </div>

            {/* Dates & Location */}
            <div className="text-base text-stone-400 font-mono mb-6 border-b border-stone-700/50 pb-4 space-y-2">
                {isEditing ? (
                    <div className="flex gap-2 items-center flex-wrap">
                        <DateEditor rawYear={editForm.startYear} onChange={(val) => handleInputChange('startYear', val)} />
                        <span>—</span>
                        <DateEditor rawYear={editForm.endYear} onChange={(val) => handleInputChange('endYear', val)} />
                    </div>
                ) : (
                    <div>{formatYearSmart(entity.startYear)} — {formatYearSmart(entity.endYear)}</div>
                )}

                <div className="flex items-center">
                    <span className="text-stone-500 text-sm uppercase font-bold mr-2">{lang === 'en' ? 'Location' : 'Локация'}:</span>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editForm.location[lang]} 
                            onChange={(e) => handleInputChange('location', e.target.value, lang)}
                            className="flex-1 bg-stone-800 border border-stone-600 rounded px-1 text-sm text-white focus:border-gold outline-none"
                        />
                    ) : (
                        <span className="text-stone-300 font-serif">{entity.location[lang]}</span>
                    )}
                </div>
            </div>
            
            {/* Description */}
            <div className="relative">
                {isEditing ? (
                    <>
                        <div className="flex justify-end mb-1">
                            <button 
                                onClick={handleAiGenerateDescription}
                                disabled={isGenerating}
                                className="text-[10px] bg-purple-900/50 text-purple-300 border border-purple-700 hover:bg-purple-800 px-2 py-0.5 rounded flex items-center gap-1"
                            >
                                ✨ {lang === 'en' ? 'AI Generate' : 'AI Генерация'}
                            </button>
                        </div>
                        <textarea 
                            value={editForm.description[lang]} 
                            onChange={(e) => handleInputChange('description', e.target.value, lang)}
                            className="w-full h-64 bg-stone-800 border border-stone-600 rounded p-2 text-base font-serif text-stone-300 focus:border-gold outline-none resize-none custom-scrollbar"
                        />
                    </>
                ) : (
                    <div className="font-serif text-stone-300 leading-relaxed mt-4">
                        {renderFormattedText(entity.description[lang])}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Right Side: Timeline/Events List OR Chat */}
        <div className="w-1/2 flex flex-col bg-stone-900/30 border-l border-stone-700/30">
          
          <div className="flex border-b border-stone-700/50 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-20">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 text-center text-sm font-bold uppercase tracking-widest ${activeTab === 'info' ? 'text-gold border-b-2 border-gold' : 'text-stone-500 hover:text-stone-300'}`}
              >
                  {lang === 'en' ? 'Events & Facts' : 'События и Факты'}
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-center text-sm font-bold uppercase tracking-widest ${activeTab === 'chat' ? 'text-gold border-b-2 border-gold' : 'text-stone-500 hover:text-stone-300'}`}
              >
                  {lang === 'en' ? 'AI Historian' : 'ИИ Историк'}
              </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
            
            {activeTab === 'info' && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-stone-500 uppercase">
                            {lang === 'en' ? 'Timeline' : 'Хронология'}
                        </h3>

                        {isEditing && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleAiGenerateEvents}
                                    disabled={isGenerating}
                                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 border border-purple-800 bg-purple-900/30 px-3 py-1 rounded text-xs uppercase font-bold"
                                >
                                    ✨ {lang === 'en' ? 'AI Auto-Events' : 'AI События'}
                                </button>
                                <button 
                                    onClick={handleAddEvent}
                                    className="flex items-center gap-1 text-green-400 hover:text-green-300 border border-green-800 bg-green-900/30 px-3 py-1 rounded text-xs uppercase font-bold"
                                >
                                    + {lang === 'en' ? 'Add' : 'Добавить'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {/* Existing Events (Editable) */}
                        {editForm.events && editForm.events.sort((a,b) => a.year - b.year).map((evt, idx) => (
                            <div key={'existing-'+idx} className="flex gap-4 group p-3 hover:bg-stone-800/50 rounded-lg transition-colors border-b border-stone-800/50 items-start">
                                <div className="w-24 flex-shrink-0 pt-1 flex flex-col gap-1">
                                    {isEditing ? (
                                        <DateEditor 
                                            rawYear={evt.year} 
                                            onChange={(val) => handleEventChange(idx, 'year', val)}
                                            className="w-full"
                                        />
                                    ) : (
                                        <div className="text-right text-gold text-sm font-mono">{formatYearSmart(evt.year)}</div>
                                    )}
                                </div>
                                
                                <div className="flex-1 relative pl-4 border-l-2 border-stone-700 group-hover:border-gold transition-colors">
                                    {isEditing ? (
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                type="text"
                                                value={evt.title ? evt.title[lang] : ''}
                                                onChange={(e) => handleEventChange(idx, 'title_val', e.target.value, lang)}
                                                placeholder="Event Title"
                                                className="bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 font-bold w-full focus:border-gold outline-none"
                                            />
                                            <textarea 
                                                value={evt.description[lang]}
                                                onChange={(e) => handleEventChange(idx, 'desc_val', e.target.value, lang)}
                                                placeholder="Description"
                                                className="bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-300 text-sm resize-y min-h-[60px] focus:border-gold outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="text-stone-200 font-bold text-lg mb-2">{evt.title ? evt.title[lang] : ''}</h4>
                                            <p className="text-stone-300 text-base leading-relaxed">{evt.description[lang]}</p>
                                        </>
                                    )}
                                </div>

                                {isEditing && (
                                    <button 
                                        onClick={() => handleDeleteEvent(idx)}
                                        className="text-stone-600 hover:text-red-500 p-1"
                                        title="Delete event"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}

                        {(!editForm.events || editForm.events.length === 0) && (
                            <div className="flex items-center justify-center py-10">
                                    <p className="text-stone-600 italic">No events listed.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
            
            {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" ref={chatScrollRef}>
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-stone-700 text-stone-100 rounded-tr-none' 
                                    : 'bg-stone-800/80 text-stone-300 border border-stone-700/50 rounded-tl-none font-serif'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                         {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-stone-800/80 p-3 rounded-lg rounded-tl-none border border-stone-700/50 flex gap-1">
                                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="relative">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={lang === 'en' ? "Ask about this era..." : "Спросите об этой эпохе..."}
                            className="w-full bg-black/30 border border-stone-600 rounded-full px-4 py-2 text-stone-200 focus:border-gold outline-none pr-10"
                            disabled={isChatLoading}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isChatLoading}
                            className="absolute right-1 top-1 w-8 h-8 rounded-full bg-gold/10 hover:bg-gold/20 text-gold flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;