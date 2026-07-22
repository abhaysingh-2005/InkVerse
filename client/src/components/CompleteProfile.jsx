import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CompleteProfile = () => {
  const navigate = useNavigate();

  // Basic Information
  const [profileImage, setProfileImage] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  // Personal Details
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  // Contact Information
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existingImage = localStorage.getItem('userImage') || '';
    const existingName = localStorage.getItem('userName') || '';
    const existingUsername = localStorage.getItem('userHandle') || existingName.toLowerCase().replace(/\s+/g, '_');
    const existingBio = localStorage.getItem('userBio') || '';
    const existingAddress = localStorage.getItem('userAddress') || '';
    const existingDob = localStorage.getItem('userDob') || '';
    const existingGender = localStorage.getItem('userGender') || '';
    const existingPhone = localStorage.getItem('userPhone') || '';
    const existingEmail = localStorage.getItem('userEmail') || 'user@example.com';

    setProfileImage(existingImage);
    setFullName(existingName);
    setUsername(existingUsername);
    setBio(existingBio);
    setAddress(existingAddress);
    setDob(existingDob);
    setGender(existingGender);
    setEmail(existingEmail);

    if (existingPhone) {
      const digitsOnly = existingPhone.replace(/\D/g, '');
      setPhone(digitsOnly.slice(-10));
    }
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const countWords = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const bioWordCount = countWords(bio);

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      return toast.error("Please enter your full name");
    }
    if (!username.trim()) {
      return toast.error("Please enter a username");
    }

    // Bio word count validation (12 - 50 words)
    if (bioWordCount < 12 || bioWordCount > 50) {
      return toast.error(`Bio must contain between 12 and 50 words (current: ${bioWordCount} words)`);
    }

    if (phone.length !== 10) {
      return toast.error("Please enter a valid 10-digit mobile phone number");
    }

    setLoading(true);
    try {
      localStorage.setItem('userImage', profileImage || '');
      localStorage.setItem('userName', fullName.trim());
      localStorage.setItem('userHandle', username.trim());
      localStorage.setItem('userBio', bio.trim());
      localStorage.setItem('userAddress', address.trim());
      localStorage.setItem('userDob', dob);
      localStorage.setItem('userGender', gender);
      localStorage.setItem('userPhone', `+91 ${phone}`);
      localStorage.setItem('userEmail', email);

      toast.success("Profile updated & saved successfully!");
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>👤</span> Complete Your Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Manage your basic information, personal details, and contact details
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSaveProfile}>
          
          {/* ================= SECTION 1: BASIC INFORMATION ================= */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-800/60 pb-2">
              <span>📌</span> Section 1: Basic Information
            </h2>

            {/* Profile Photo */}
            <div className="flex items-center gap-5 pt-2">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/40 shadow-lg flex-shrink-0">
                <img
                  src={profileImage || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <label htmlFor="photo-upload" className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition inline-block">
                  📷 Change Profile Photo
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">Recommended: Square JPG or PNG</p>
              </div>
            </div>

            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Abhay Singh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs">@</span>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="abhay_writer"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  />
                </div>
              </div>
            </div>

            {/* Bio with Word Counter */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bio <span className="text-slate-500 text-[11px] font-normal">(Required: 12 - 50 words)</span>
                </label>
                <span className={`text-[11px] font-mono font-bold ${bioWordCount >= 12 && bioWordCount <= 50 ? 'text-green-400' : 'text-amber-400'}`}>
                  {bioWordCount} / 12-50 words
                </span>
              </div>
              <textarea
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                placeholder="Write a brief intro about yourself (e.g. I am a passionate blogger who loves writing about technology, AI innovations, and modern web software developments across the globe.)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* ================= SECTION 2: PERSONAL DETAILS ================= */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-800/60 pb-2">
              <span>📋</span> Section 2: Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Gender</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Location / Address</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. New Delhi, India"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: CONTACT INFORMATION ================= */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-800/60 pb-2">
              <span>📞</span> Section 3: Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number (10 Digits)</label>
                <div className="flex gap-2">
                  <span className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-400 text-xs font-mono flex items-center">+91</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono tracking-wider transition-colors"
                    placeholder="9876543210"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">🔒 Auto-synced from Google</span>
                </div>
                <input
                  type="email"
                  disabled
                  readOnly
                  className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed font-mono opacity-80"
                  value={email}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-6 border border-transparent text-xs font-bold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 cursor-pointer shadow-xl shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Saving Profile..." : "Save Complete Profile →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;



