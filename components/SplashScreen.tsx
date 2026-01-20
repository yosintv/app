
import React from 'react';
import { LOGO_URL } from '../constants';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#1f41bb] via-[#1e3a8a] to-[#172554] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />

      {/* Football Animation */}
      <div className="absolute animate-football text-4xl select-none">⚽</div>
      
      {/* Cricket Animation */}
      <div className="absolute animate-cricket text-4xl select-none">🏏</div>

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center animate-logo-in">
        <div className="p-8 bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] mb-4 transform transition-transform duration-700 hover:scale-105">
          <img 
            src={LOGO_URL} 
            alt="YoSinTV Logo" 
            className="w-52 h-auto object-contain"
            onError={(e) => (e.currentTarget.src = 'https://web.cricfoot.net/logo.png')}
          />
        </div>

        {/* Support Text */}
        <div className="mb-8 text-center">
          <span className="text-white font-sport text-sm tracking-[0.2em] font-bold uppercase drop-shadow-lg">
            24x7 Live Supports
          </span>
        </div>
        
        {/* Loading Indicator */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
          </div>
          <span className="text-white/40 font-sport text-[10px] tracking-[0.4em] font-black uppercase">
            Entering Stadium
          </span>
        </div>
      </div>

      <style>{`
        @keyframes football-path {
          0% { transform: translate(-120vw, 20vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          45% { transform: translate(0vw, -30vh) rotate(360deg); }
          55% { transform: translate(10vw, -30vh) rotate(360deg); }
          90% { opacity: 1; }
          100% { transform: translate(120vw, 40vh) rotate(720deg); opacity: 0; }
        }
        @keyframes cricket-path {
          0% { transform: translate(120vw, -40vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translate(-10vw, 20vh) rotate(-360deg); }
          90% { opacity: 1; }
          100% { transform: translate(-120vw, -20vh) rotate(-720deg); opacity: 0; }
        }
        @keyframes logo-in {
          0% { opacity: 0; transform: scale(0.6) translateY(30px); filter: blur(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .animate-football {
          animation: football-path 3s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
          left: 0;
          top: 30%;
        }
        .animate-cricket {
          animation: cricket-path 3.5s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
          right: 0;
          bottom: 20%;
        }
        .animate-logo-in {
          animation: logo-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
