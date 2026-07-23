import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
  const { axios, setToken } = useAppContext();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState(false);

  if (!isOpen) return null;

  const saveLoginSession = (data) => {
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userName', data.user.name || '');
    localStorage.setItem('userEmail', data.user.email || '');
    localStorage.setItem('userImage', data.user.picture || '');
    localStorage.setItem('userRole', data.user.role || 'Writer');
    if (data.user.role === 'Admin') {
      localStorage.setItem('token', data.token);
    }
    setToken(data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  // Option 1: Google Sign-In (Auto Admin or User based on Google account email)
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setGoogleError(false);
      const { data } = await axios.post('/api/user/google-login', {
        token: credentialResponse.credential
      });

      if (data.success) {
        saveLoginSession(data);
        const isAdmin = data.user.role === 'Admin';
        toast.success(isAdmin ? "Logged in as Admin!" : `Welcome, ${data.user.name}!`);
        onClose();
        navigate(isAdmin ? '/admin' : '/');
        window.location.reload();
      } else {
        toast.error(data.message || 'Google Sign-In failed');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Google Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Option 2: Email & Password Authentication (Auto Admin or User based on email)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      return toast.error("Please fill in all required fields");
    }

    try {
      setLoading(true);
      const endpoint = isRegister ? '/api/user/register' : '/api/user/login';
      const payload = isRegister ? { name, email, password } : { email, password };

      const { data } = await axios.post(endpoint, payload);

      if (data.success) {
        saveLoginSession(data);
        const isAdmin = data.user.role === 'Admin';
        toast.success(isAdmin ? "Logged in as Admin!" : data.message || "Signed in successfully!");
        onClose();
        navigate(isAdmin ? '/admin' : '/');
        window.location.reload();
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Quick One-Click Demo Helper
  const handleQuickDemo = async (role) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/user/demo-login', { role });
      if (data.success) {
        saveLoginSession(data);
        toast.success(`Logged in as ${data.user.name}!`);
        onClose();
        navigate(role === 'Admin' ? '/admin' : '/dashboard');
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 text-slate-100 shadow-2xl relative my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Ink<span className="text-indigo-500">Verse</span> Sign In
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose how you would like to authenticate
          </p>
        </div>

        {/* ================= OPTION 1: GOOGLE SIGN-IN ================= */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl mb-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="bg-indigo-600/30 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">Option 1</span>
            <span className="text-xs font-bold text-white">Google Account Sign-In</span>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setGoogleError(true);
                toast.error('Google popup blocked by browser');
              }}
              theme="filled_blue"
              shape="pill"
              size="large"
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            💡 If Admin Google Account, opens Admin Panel. Otherwise opens User Dashboard.
          </p>

          {googleError && (
            <div className="mt-2 bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl text-[11px] text-amber-300">
              ⚠️ Google Sign-In blocked by browser. Please use Option 2 (Email & Password) below!
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center my-4 before:flex-1 before:border-t before:border-slate-800 after:flex-1 after:border-t after:border-slate-800">
          <span className="mx-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">OR</span>
        </div>

        {/* ================= OPTION 2: EMAIL & PASSWORD SIGN-IN ================= */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600/30 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">Option 2</span>
              <span className="text-xs font-bold text-white">Email & Password</span>
            </div>
            
            {/* Toggle Sign In / Register */}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
            >
              {isRegister ? "Switch to Sign In" : "Create Account"}
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhay Singh"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? "Authenticating..." : isRegister ? "Register Account →" : "Sign In with Email →"}
            </button>
          </form>

          {/* Quick Demo Login Fillers */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Quick Test:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('Writer')}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer"
              >
                ✍️ User Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Admin')}
                className="text-xs bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer"
              >
                🛡️ Admin Demo
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthModal;
