import React, { useState } from 'react';
import { UserPreferences } from '../types';

interface UserProfileViewProps {
  userPrefs: UserPreferences;
  onUpdateUserPrefs: (prefs: Partial<UserPreferences>) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onOpenLoginPage?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userPrefs,
  onUpdateUserPrefs,
  isDark = true,
  onToggleTheme,
  onOpenLoginPage,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(userPrefs.name);
  const [editEmail, setEditEmail] = useState(userPrefs.email);
  const [editMobile, setEditMobile] = useState(userPrefs.phoneNumber || '');
  const [editAvatar, setEditAvatar] = useState(userPrefs.avatar);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserPrefs({
      name: editName.trim() || 'Indresh G',
      email: editEmail.trim() || 'indreshgovindarasu08@gmail.com',
      phoneNumber: editMobile.replace(/\D/g, '').slice(0, 10),
      avatar: editAvatar.trim() || 'IG',
      isLoggedIn: true,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white pt-20 pb-32 font-sans">
      <main className="max-w-4xl mx-auto px-4 md:px-10 pt-6">
        {/* Profile Header */}
        <section className="bg-[#121212] border border-white/15 p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
          <div className="w-20 h-20 bg-white text-black font-display font-black text-2xl flex items-center justify-center shrink-0 border border-white">
            {userPrefs.avatar}
          </div>

          <div className="flex-grow text-center md:text-left flex flex-col justify-center h-full">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                {userPrefs.name}
              </h1>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#ff3e00] text-white uppercase tracking-widest">
                VERIFIED COMMUTER
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-xs font-mono">
              <span className="text-white/60">{userPrefs.email}</span>
              {userPrefs.phoneNumber && (
                <span className="text-[#00f0ff] font-bold">
                  📱 +91 {userPrefs.phoneNumber}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => {
                setEditName(userPrefs.name);
                setEditEmail(userPrefs.email);
                setEditMobile(userPrefs.phoneNumber || '');
                setEditAvatar(userPrefs.avatar);
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#181818] border border-white/20 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer active:scale-95"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                if (onOpenLoginPage) {
                  onOpenLoginPage();
                } else {
                  window.location.hash = 'login';
                }
              }}
              className="px-4 py-2.5 bg-[#ff3e00]/10 border border-[#ff3e00]/40 text-xs font-mono font-bold uppercase tracking-wider text-[#ff3e00] hover:bg-[#ff3e00] hover:text-white transition-all cursor-pointer"
            >
              Login / Switch User &rarr;
            </button>
          </div>
        </section>

        {/* Quick Summary Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Bento Item 1: Route */}
          <div className="bg-[#121212] border border-white/10 p-5 flex items-center gap-4 hover:border-[#ff3e00] transition-colors">
            <div className="w-10 h-10 bg-white/5 text-[#ff3e00] flex items-center justify-center shrink-0 border border-white/10">
              <span className="material-symbols-outlined text-[20px]">route</span>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                Strategy
              </p>
              <p className="text-base font-display font-black text-white uppercase">
                {userPrefs.preferredRoute}
              </p>
            </div>
          </div>

          {/* Bento Item 2: Accessibility */}
          <div className="bg-[#121212] border border-white/10 p-5 flex items-center gap-4 hover:border-[#ff3e00] transition-colors">
            <div className="w-10 h-10 bg-white/5 text-white flex items-center justify-center shrink-0 border border-white/10">
              <span className="material-symbols-outlined text-[20px]">accessible</span>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                Mobility Profile
              </p>
              <p className="text-base font-display font-black text-white uppercase">
                {userPrefs.accessibility}
              </p>
            </div>
          </div>

          {/* Bento Item 3: Language */}
          <div className="bg-[#121212] border border-white/10 p-5 flex items-center gap-4 hover:border-[#ff3e00] transition-colors">
            <div className="w-10 h-10 bg-white/5 text-white flex items-center justify-center shrink-0 border border-white/10">
              <span className="material-symbols-outlined text-[20px]">language</span>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                Interface Language
              </p>
              <p className="text-base font-display font-black text-white uppercase">
                {userPrefs.appLanguage}
              </p>
            </div>
          </div>
        </section>

        {/* Settings Groups */}
        <div className="space-y-6">
          {/* Navigation Preferences */}
          <section className="bg-[#121212] border border-white/15 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-black/50">
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ff3e00]">explore</span>
                Navigation Preferences
              </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Preferred Route */}
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Preferred Route</span>
                  <p className="text-[11px] text-white/50 uppercase mt-0.5">Strategy for indoor station pathfinding</p>
                </div>
                <select
                  value={userPrefs.preferredRoute}
                  onChange={(e) => onUpdateUserPrefs({ preferredRoute: e.target.value as any })}
                  className="bg-black border border-white/20 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-[#ff3e00] cursor-pointer"
                >
                  <option value="Fastest">Fastest</option>
                  <option value="Shortest">Shortest</option>
                  <option value="Least Transfers">Least Transfers</option>
                </select>
              </div>

              {/* Avoid Stairs */}
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Avoid Stairs</span>
                  <p className="text-[11px] text-white/50 uppercase mt-0.5">Always prioritize elevators and step-free ramps</p>
                </div>
                <input
                  type="checkbox"
                  checked={userPrefs.avoidStairs}
                  onChange={(e) => onUpdateUserPrefs({ avoidStairs: e.target.checked })}
                  className="accent-[#ff3e00] w-5 h-5 cursor-pointer"
                />
              </div>

              {/* Mobility Support Level */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Accessibility Profile</span>
                  <p className="text-[11px] text-white/50 uppercase mt-0.5">Tailor routing for specific mobility assistance</p>
                </div>
                <select
                  value={userPrefs.accessibility}
                  onChange={(e) => onUpdateUserPrefs({ accessibility: e.target.value as any })}
                  className="bg-black border border-white/20 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-[#ff3e00] cursor-pointer"
                >
                  <option value="Wheelchair">Wheelchair</option>
                  <option value="Standard">Standard</option>
                  <option value="Visual Assist">Visual Assist</option>
                  <option value="Hearing Assist">Hearing Assist</option>
                </select>
              </div>
            </div>
          </section>

          {/* Language & Voice */}
          <section className="bg-[#121212] border border-white/15 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-black/50">
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ff3e00]">record_voice_over</span>
                Language &amp; Voice Synthesis
              </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* App Language */}
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">App Language</span>
                  <p className="text-[11px] text-white/50 uppercase mt-0.5">Display text and speech synthesis language</p>
                </div>
                <select
                  value={userPrefs.appLanguage}
                  onChange={(e) => onUpdateUserPrefs({ appLanguage: e.target.value as any })}
                  className="bg-black border border-white/20 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-[#ff3e00] cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Japanese">Japanese</option>
                  <option value="French">French</option>
                </select>
              </div>

              {/* Voice Guidance */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Voice Guidance</span>
                  <p className="text-[11px] text-white/50 uppercase mt-0.5">Read turn-by-turn navigation &amp; assistant aloud</p>
                </div>
                <input
                  type="checkbox"
                  checked={userPrefs.voiceGuidance}
                  onChange={(e) => onUpdateUserPrefs({ voiceGuidance: e.target.checked })}
                  className="accent-[#ff3e00] w-5 h-5 cursor-pointer"
                />
              </div>

              {/* Geolocation & Nearby Stations */}
              <div className="flex justify-between items-center py-2 border-t border-white/10 pt-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Location Geo-Services</span>
                    <span className="text-[9px] font-mono bg-[#00f0ff]/20 text-[#00f0ff] px-1.5 py-0.2 rounded">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-white/50 uppercase mt-0.5">
                    Proximity station ranking &amp; automatic outdoor-to-indoor handoff
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400">GPS ENABLED</span>
                </div>
              </div>
            </div>
          </section>

          {/* Theme & Display Appearance */}
          <section className="bg-[#121212] border border-white/15 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-black/50">
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ff3e00]">palette</span>
                Appearance &amp; Display Theme
              </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Color Theme</span>
                  <p className="text-[11px] text-white/50 uppercase mt-0.5">
                    Toggle between Spatial High-Contrast Dark and Crisp Light mode
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-[#ff3e00] bg-[#181818] text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-300">
                    {isDark ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Edit Profile Modal Dialog */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#121212] border border-white/20 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Edit Profile Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-xs font-bold uppercase tracking-wider text-white focus:border-[#ff3e00] outline-none"
                  placeholder="Indresh G"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-xs font-bold uppercase tracking-wider text-white focus:border-[#ff3e00] outline-none"
                  placeholder="indreshgovindarasu08@gmail.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                  Mobile Number (10 Digits)
                </label>
                <div className="flex items-center bg-black border border-white/20 focus-within:border-[#ff3e00]">
                  <span className="px-3 text-xs font-mono text-[#ff3e00] font-bold border-r border-white/10">+91</span>
                  <input
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-transparent p-3 text-xs font-mono font-bold text-white outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                  Avatar Initials
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value.toUpperCase())}
                  className="w-full bg-black border border-white/20 p-3 text-xs font-bold uppercase tracking-wider text-white focus:border-[#ff3e00] outline-none"
                  placeholder="IG"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-[#ff3e00] hover:text-white cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
