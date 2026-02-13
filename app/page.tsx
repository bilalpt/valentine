'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Heart, Sparkles, Wand2, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
enum ValentineState {
  ASKING = 'ASKING',
  ACCEPTED = 'ACCEPTED',
}

// --- Components ---
const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prev) => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 100,
          size: Math.random() * (30 - 10) + 10,
          duration: Math.random() * (10 - 5) + 5,
        },
      ].slice(-15));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-[-40px] text-rose-200/40 select-none animate-float-up"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
          }}
        >
          ❤️
        </div>
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up linear forwards;
        }
      `}</style>
    </div>
  );
};

// --- Main Page ---
export default function Home() {
  const [state, setState] = useState<ValentineState>(ValentineState.ASKING);
  const [noCount, setNoCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [loveNote, setLoveNote] = useState<string>('');
  const [loadingNote, setLoadingNote] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const fallbackMessages = [
    "My love for you is beyond words! ❤️",
    "You are the most beautiful part of my life. 💕",
    "Every heartbeat whispers your name. 💓",
    "With you, forever doesn’t feel long enough. 💖",
    "You are my today and all my tomorrows. 🌹",
    "Loving you is my favorite destiny. 💘",
    "You light up my world like no one else. ✨",
    "My heart chose you, and it never regrets. 💞",
    "You are my sweetest dream come true. 🌷",
    "Forever feels perfect when it’s with you. 💝"
  ];

  const noMessages = [
    "think again !",
    "Really ?",
    "But why not ?",
    "please reconsider !"
  ];

  const currentFeedback = useMemo(() => {
    if (noCount === 0) return null;
    return noMessages[(noCount - 1) % noMessages.length];
  }, [noCount]);

  const handleNoClick = () => {
    setNoCount(prev => prev + 1);
  };

  const handleYesClick = async () => {
    setState(ValentineState.ACCEPTED);
    setLoadingNote(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a very short, premium, elegant Valentine's note for ${userName || 'my love'}. Use a few heart emojis. Maximum 100 characters.`,
      });

      setLoveNote(response.text || fallbackMessages[messageIndex]);

    } catch (error) {
      const currentMessage = fallbackMessages[messageIndex];
      setLoveNote(currentMessage);

      setMessageIndex((prev) => {
        if (prev === fallbackMessages.length - 1) {
          return 0; // restart after 10th
        }
        return prev + 1;
      });
    } finally {
      setLoadingNote(false);
    }
  };

  const yesButtonScale = 1 + (noCount * 0.35);

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FFFDFB] overflow-hidden">
      <FloatingHearts />
      
      {state === ValentineState.ASKING ? (
        <div className="z-10 flex flex-col items-center text-center max-w-lg w-full space-y-10">
          
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-inner border border-rose-50 relative overflow-hidden">
               <Heart className={`w-12 h-12 text-rose-400 ${noCount > 0 ? 'animate-bounce' : 'animate-pulse'}`} fill="currentColor" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-amber-300 w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif text-rose-800 tracking-tight italic">
              Will you be my Valentine?
            </h1>
          </div>

          <div className="w-full max-w-xs relative flex flex-col items-center pt-8">
            {currentFeedback && (
              <div className="absolute top-0 animate-in slide-in-from-bottom-2 fade-in duration-300">
                <span className="text-rose-500 font-medium text-sm flex items-center gap-1.5 bg-rose-50/50 px-3 py-1 rounded-full border border-rose-100">
                  <Info className="w-3 h-3" />
                  {currentFeedback}
                </span>
              </div>
            )}

            <input 
              type="text" 
              placeholder="Your name..." 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border border-rose-100 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-rose-200 focus:outline-none transition-all text-center text-rose-900 placeholder:text-rose-200"
            />
          </div>

          <div className="flex items-center justify-center gap-8 w-full min-h-[140px]">
            <button
              onClick={handleYesClick}
              style={{ 
                transform: `scale(${yesButtonScale})`,
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              className="z-20 px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200/50 flex items-center gap-2 group whitespace-nowrap"
            >
              <Heart className="w-5 h-5 fill-current" />
              Yes, I will!
            </button>

            <button
              onClick={handleNoClick}
              className="z-10 px-8 py-4 bg-white border border-slate-200 text-slate-400 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-500 transition-all active:scale-95"
            >
              No
            </button>
          </div>
          
          <p className="text-rose-200 font-medium tracking-widest uppercase text-[10px] pt-12">
            A timeless request
          </p>
        </div>
      ) : (
        <div className="z-10 flex flex-col items-center text-center max-w-xl w-full animate-in slide-in-from-top-10 fade-in duration-1000">

          <h2 className="text-5xl md:text-7xl font-serif text-rose-700 mb-4 italic">
            Wonderful! ❤️
          </h2>

          {userName && (
            <p className="text-2xl text-rose-500 mb-6 font-serif italic">
              For {userName} 💖
            </p>
          )}

          <div className="bg-white p-2 rounded-2xl shadow-xl border border-rose-100 w-full">
            <div className="bg-[#FFFDFB] p-10 md:p-14 rounded-xl border border-rose-50/50 relative">
              <Wand2 className="absolute top-4 right-4 text-rose-200 w-5 h-5" />
              <div className="relative z-10 flex items-center justify-center">
                {loadingNote ? (
                  <div className="animate-pulse text-rose-300 font-medium">
                    Writing something special...
                  </div>
                ) : (
                  <p className="text-2xl md:text-3xl text-rose-800 italic font-serif leading-relaxed">
                    {loveNote}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="mt-12 bg-red-800 w-20 h-12 rounded-2xl text-rose-300 hover:text-rose-500 text-xs font-bold tracking-widest uppercase underline underline-offset-8 transition-colors"
          >
            Back
          </button>
        </div>
      )}
    </main>
  );
}
