import React, { useState } from 'react';
import { Language, ViewportState } from '../types';

interface ControlsProps {
  lang: Language;
  setLang: (l: Language) => void;
  viewport: ViewportState;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
  isDevMode: boolean;
  setIsDevMode: (v: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({ lang, setLang, isDevMode, setIsDevMode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <>
      {/* Top Bar - Right Aligned Controls Only */}
      <div className="absolute top-0 right-0 h-16 flex items-center justify-end px-6 pointer-events-none z-50">
        
        <div className="pointer-events-auto flex gap-4 items-center bg-black/40 p-2 rounded-full backdrop-blur-sm border border-stone-700/50">
          {/* Dev Mode Toggle */}
          <div className="flex items-center gap-2 rounded p-1 pointer-events-auto">
             <span className="text-[10px] uppercase text-stone-400 font-bold pl-1">Dev</span>
             <button 
               onClick={() => setIsDevMode(!isDevMode)}
               className={`w-8 h-4 rounded-full relative transition-colors ${isDevMode ? 'bg-green-600' : 'bg-stone-600'}`}
             >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isDevMode ? 'left-4.5 translate-x-0' : 'left-0.5'}`} style={{ left: isDevMode ? 'calc(100% - 14px)' : '2px' }} />
             </button>
          </div>

          {/* Language Toggle */}
          <div className="flex gap-1 rounded p-1 border-l border-stone-600 pl-3">
            <button 
              onClick={() => setLang('en')} 
              className={`px-2 py-0.5 rounded ${lang === 'en' ? 'text-gold font-bold' : 'text-stone-400 hover:text-white'} text-xs transition-all`}
            >
              EN
            </button>
            <span className="text-stone-600">/</span>
            <button 
              onClick={() => setLang('ru')} 
              className={`px-2 py-0.5 rounded ${lang === 'ru' ? 'text-gold font-bold' : 'text-stone-400 hover:text-white'} text-xs transition-all`}
            >
              RU
            </button>
          </div>

          {/* Google Auth Button */}
          <button 
            onClick={toggleAuth}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95 ml-2
              ${isLoggedIn ? 'bg-transparent border-gold' : 'bg-white border-transparent'}
            `}
            title={isLoggedIn ? 'Profile' : 'Sign in with Google'}
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
    </>
  );
};

export default Controls;