import React from 'react';
import { Experience } from './components/Experience';
import GestureHandler from './components/GestureHandler';
import { useTreeStore } from './store';
import { AppState } from './types';

const UIOverlay: React.FC = () => {
    const { appState, handGesture } = useTreeStore();

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">
            {/* Header */}
            <header className="text-center">
                <h1 className="font-serif text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-gold-100 to-gold-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wider">
                    THE GRAND CHRISTMAS
                </h1>
                <p className="font-serif text-gold-300 mt-2 text-lg tracking-widest uppercase opacity-80">
                    Interactive Luxury Experience
                </p>
            </header>

            {/* Instructions */}
            <div className="flex flex-col items-center justify-center space-y-4 text-gold-100 opacity-70">
                <div className="flex items-center space-x-8 bg-black/40 backdrop-blur-md p-4 rounded-full border border-gold-900">
                    <div className={`flex flex-col items-center transition-all duration-500 ${handGesture.gesture === 'Closed_Fist' ? 'scale-125 text-gold-300' : 'scale-100'}`}>
                        <span className="text-2xl mb-1">✊</span>
                        <span className="text-xs font-serif tracking-widest">FORM</span>
                    </div>
                    <div className="h-8 w-px bg-gold-700/50"></div>
                    <div className={`flex flex-col items-center transition-all duration-500 ${handGesture.gesture === 'Open_Palm' ? 'scale-125 text-gold-300' : 'scale-100'}`}>
                        <span className="text-2xl mb-1">✋</span>
                        <span className="text-xs font-serif tracking-widest">UNLEASH</span>
                    </div>
                     <div className="h-8 w-px bg-gold-700/50"></div>
                     <div className={`flex flex-col items-center transition-all duration-500`}>
                        <span className="text-2xl mb-1">👆</span>
                        <span className="text-xs font-serif tracking-widest">MOVE</span>
                    </div>
                </div>
            </div>

            {/* Status Footer */}
            <div className="flex justify-between items-end">
                <div className="text-gold-500 font-mono text-xs">
                    SYSTEM STATUS: <span className={appState === AppState.FORMED ? "text-emerald-400" : "text-red-400"}>{appState}</span>
                    <br/>
                    GESTURE: {handGesture.gesture}
                </div>
                <div className="text-right">
                    <p className="font-serif text-gold-700 text-sm">DESIGNED FOR MAGNIFICENCE</p>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black">
      <UIOverlay />
      <GestureHandler />
      <Experience />
    </div>
  );
};

export default App;