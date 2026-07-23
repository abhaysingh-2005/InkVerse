import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { GoogleLogin } from '@react-oauth/google';
import { assets } from '../assets/assets';
import { toast } from 'react-hot-toast';
import AuthModal from './AuthModal';

const Navbar = () => {
  const navigate = useNavigate(); 
  const { axios, setToken } = useAppContext(); 
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const hasUserToken = !!localStorage.getItem('userToken') || !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || (localStorage.getItem('token') ? 'Admin' : 'Writer');

  const handleUserGoogleSuccess = async (credentialResponse) => {
      try {
          const { data } = await axios.post('/api/user/google-login', { 
              token: credentialResponse.credential 
          });

          if (data.success) {
              localStorage.setItem('userToken', data.token);
              localStorage.setItem('userImage', data.user.picture || '');
              localStorage.setItem('userName', data.user.name || '');
              localStorage.setItem('userEmail', data.user.email || '');
              localStorage.setItem('userRole', data.user.role || 'Writer');

              if (data.user.role === 'Admin') {
                localStorage.setItem('token', data.token);
              }
              setToken(data.token);
              axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
              toast.success(`Welcome, ${data.user.name}!`);

              const existingPhone = localStorage.getItem('userPhone');
              if (data.user.role !== 'Admin' && !existingPhone) {
                navigate('/complete-profile');
              } else {
                navigate('/');
                window.location.reload();
              }
          } else {
              toast.error(data.message || 'Login failed');
          }
      } catch (error) {
          toast.error(error.response?.data?.message || error.message || 'Google Login failed');
          setIsAuthModalOpen(true);
      }
  };

  const handleQuickDemo = async (role) => {
    try {
      const { data } = await axios.post('/api/user/demo-login', { role });

      if (data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userImage', data.user.picture);
        localStorage.setItem('userRole', data.user.role);
        if (role === 'Admin') {
          localStorage.setItem('token', data.token);
        }
        setToken(data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        toast.success(`Logged in as ${data.user.name}!`);
        navigate(role === 'Admin' ? '/admin' : '/dashboard');
        window.location.reload();
      } else {
        toast.error(data.message || "Demo login failed");
      }
    } catch (error) {
      toast.error(error.message || "Demo login failed");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="flex justify-between items-center py-4 px-6 sm:px-12 max-w-7xl mx-auto">
          {/* Logo */}
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer select-none group">
            <img 
              src={assets.logo_pic || assets.logo_light} 
              alt="InkVerse Logo" 
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Ink<span className="text-indigo-500">Verse</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition cursor-pointer text-sm flex items-center justify-center shadow-sm"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>

            {/* Single Sign In Button */}
            {!hasUserToken ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>👤</span> Sign In
              </button>
            ) : (
              /* Logged In User / Admin Dropdown */
              <div className="relative">
                <div 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-1.5 px-3 rounded-full hover:border-slate-700 transition shadow-sm"
                >
                  <img 
                    src={localStorage.getItem('userImage') || "https://api.dicebear.com/7.x/adventurer/svg?seed=som"} 
                    alt="Profile" 
                    className="w-7 h-7 rounded-full border border-indigo-500/60 object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                    {localStorage.getItem('userName') || 'Profile'}
                  </span>
                  {userRole === 'Admin' && (
                    <span className="bg-indigo-600/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/40">
                      Admin
                    </span>
                  )}
                  <span className="text-slate-400 text-xs">▼</span>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 rounded-t-2xl">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Signed in as</p>
                      <p className="font-bold text-white truncate mt-0.5">{localStorage.getItem('userName') || "Writer"}</p>
                      <p className="text-[11px] text-indigo-400 font-mono mt-0.5">{localStorage.getItem('userPhone') || ""}</p>
                    </div>

                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-indigo-300 font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      📊 My Dashboard
                    </button>

                    {userRole === 'Admin' && (
                      <button 
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/admin');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-purple-300 font-bold flex items-center gap-2 transition cursor-pointer"
                      >
                        🛡️ Admin Panel
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/complete-profile');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-2 transition cursor-pointer"
                    >
                      👤 Profile Settings
                    </button>

                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                        localStorage.removeItem('userToken');
                        localStorage.removeItem('token');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userImage');
                        localStorage.removeItem('userPhone');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userEmail');
                        navigate('/');
                        window.location.reload();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-950/40 text-red-400 font-bold border-t border-slate-800 flex items-center gap-2 transition cursor-pointer"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal Component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
