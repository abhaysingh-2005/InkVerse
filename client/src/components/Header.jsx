import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';

const Header = () => {
  const { setInput, input, blogs } = useAppContext();
  const inputRef = useRef();

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (inputRef.current) setInput(inputRef.current.value);
  };

  const onClear = () => {
    setInput('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const totalArticleCount = blogs ? blogs.length : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 relative pt-14 pb-10">
      {/* Background Radial Glowing Elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-teal-500/15 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>

      <div className="text-center max-w-4xl mx-auto">
        {/* Animated Badge Chip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-cyan-500/30 bg-cyan-950/40 rounded-full text-xs font-medium text-cyan-300 shadow-lg shadow-cyan-600/10 backdrop-blur-xl">
          <span className="text-cyan-400">✨</span>
          <span>AI-Powered Writing & Discovery</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          Think Deeply. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Write What Matters.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="my-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
          A quiet space to express ideas, discover new perspectives, and share meaningful thoughts with the world.
        </p>

        {/* Glass Search Bar */}
        <form 
          onSubmit={onSubmitHandler} 
          className="flex items-center max-w-xl mx-auto bg-slate-900/80 border border-slate-800 focus-within:border-cyan-500/80 focus-within:ring-4 focus-within:ring-cyan-500/10 rounded-2xl p-2 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition-all duration-300"
        >
          <div className="pl-3 pr-2 text-slate-500 text-base">🔍</div>
          <input 
            ref={inputRef} 
            type="text" 
            placeholder="Search articles by topic, title, or category..." 
            required 
            className="w-full bg-transparent pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none" 
          />
          <button 
            type="submit" 
            className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            Search
          </button>
        </form>

        {/* Clear Search Indicator */}
        {input && (
          <div className="mt-4 flex justify-center">
            <button 
              onClick={onClear} 
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl cursor-pointer transition shadow-sm"
            >
              <span>✕</span> Clear search filter: <span className="font-semibold text-cyan-400">"{input}"</span>
            </button>
          </div>
        )}

        {/* Real Dynamic Platform Stat Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-slate-400">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-2xl backdrop-blur-md">
            <span className="text-base">🚀</span>
            <span><strong className="text-white font-bold">{totalArticleCount}</strong> Live Articles Published</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-2xl backdrop-blur-md">
            <span className="text-base">🤖</span>
            <span><strong className="text-white font-bold">AI Assistance</strong> Built-in</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-2xl backdrop-blur-md">
            <span className="text-base">⚡</span>
            <span><strong className="text-white font-bold">Instant</strong> Dark/Light Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;



