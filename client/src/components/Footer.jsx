import React from 'react';
import { assets, footer_data } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-slate-800/80">
          
          {/* Brand Info & Logo */}
          <div className="md:col-span-2 space-y-4">
            <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer select-none group inline-flex">
              <img 
                src={assets.logo_pic || assets.logo_light} 
                alt="InkVerse Logo" 
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Ink<span className="text-indigo-500">Verse</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              InkVerse is a modern publishing platform designed for thinkers, creators, and developers. Express your ideas, discover fresh perspectives, and connect with readers worldwide.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-indigo-500 hover:text-white transition">
                <img src={assets.facebook_icon} alt="Facebook" className="w-4 h-4 opacity-70 hover:opacity-100" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-indigo-500 hover:text-white transition">
                <img src={assets.twitter_icon} alt="Twitter" className="w-4 h-4 opacity-70 hover:opacity-100" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-indigo-500 hover:text-white transition">
                <img src={assets.googleplus_icon} alt="Google" className="w-4 h-4 opacity-70 hover:opacity-100" />
              </a>
            </div>
          </div>

          {/* Quick Links Sections */}
          {footer_data.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">{section.title}</h3>
              <ul className="space-y-2 text-xs">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-indigo-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 InkVerse. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

