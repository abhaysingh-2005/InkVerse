import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { GoogleLogin } from '@react-oauth/google';
import { assets } from '../assets/assets';

const Navbar = () => {
  const navigate = useNavigate(); 
  const { axios } = useAppContext(); 
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
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

              setShowAuthModal(false);
              if (data.user.role === 'Admin') {
                localStorage.setItem('token', data.token);
                navigate('/');
                window.location.reload();
              } else {
                const existingPhone = localStorage.getItem('userPhone');
                if (!existingPhone) {
                  navigate('/complete-profile');
                } else {
                  navigate('/');
                  window.location.reload();
                }
              }
          } else {
              alert(data.message);
          }
      } catch (error) {
          alert(error.message);
      }
  };

  const handleDemoLogin = (role) => {
    const isDemoAdmin = role === 'Admin';
    const demoToken = 'demo-jwt-token-' + Date.now();
    const demoName = isDemoAdmin ? 'Demo Admin' : 'Demo Writer';
    const demoEmail = isDemoAdmin ? 'abhaysingh787569@gmail.com' : 'demo@inkverse.com';
    const demoImage = isDemoAdmin 
      ? 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin' 
      : 'https://api.dicebear.com/7.x/adventurer/svg?seed=writer';

    localStorage.setItem('userToken', demoToken);
    localStorage.setItem('userName', demoName);
    localStorage.setItem('userEmail', demoEmail);
    localStorage.setItem('userImage', demoImage);
    localStorage.setItem('userRole', role);
    if (isDemoAdmin) {
      localStorage.setItem('token', demoToken);
    }

    setShowAuthModal(false);
    navigate(isDemoAdmin ? '/admin' : '/dashboard');
    window.location.reload();
  };

  return (
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

          {/* Sign In Button when NOT logged in */}
          {!hasUserToken ? (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="rounded-xl cursor-pointer h-[40px] px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>✨</span> Sign In / Join
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

      {/* Sign In Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 text-slate-100 shadow-2xl relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
                <span>✨</span> Welcome to InkVerse
              </h3>
              <p className="text-xs text-slate-400 mt-1.5">Sign in to create, publish, and manage your articles</p>
            </div>

            {/* Google OAuth Login */}
            <div className="flex flex-col items-center justify-center gap-3 mb-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-center">
              <p className="text-xs font-semibold text-slate-300 mb-1">Sign in with Google</p>
              <GoogleLogin 
                onSuccess={handleUserGoogleSuccess} 
                onError={() => alert('Google Login Failed: Please check authorized JavaScript origins in Google Cloud Console.')}
                theme="filled_blue"
                shape="pill"
                size="large"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                <span className="text-amber-400 font-semibold">ℹ️ Live domain notice:</span> If Google displays <code className="text-amber-300">origin_mismatch</code> error, add your Vercel URL to Authorized Javascript Origins in Google Console, or use Quick Demo below.
              </p>
            </div>

            <div className="flex items-center my-4 before:flex-1 before:border-t before:border-slate-800 after:flex-1 after:border-t after:border-slate-800">
              <p className="mx-3 text-center font-semibold text-slate-500 text-xs">OR QUICK DEMO</p>
            </div>

            {/* Quick Demo Login Options */}
            <div className="space-y-3">
              <button
                onClick={() => handleDemoLogin('Writer')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✍️</span> Continue as Demo Writer
              </button>
              <button
                onClick={() => handleDemoLogin('Admin')}
                className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs py-3 rounded-xl border border-indigo-500/40 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🛡️</span> Continue as Demo Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
