import React, { useState } from 'react';
import { UserPreferences, Station, TabType } from '../types';
import { SmartRailLogo } from './SmartRailLogo';
import { mockStations } from '../data/stationsData';

interface UserPortalPageProps {
  currentUser: UserPreferences;
  currentStation: Station;
  onUpdateUserPrefs: (prefs: Partial<UserPreferences>) => void;
  onLogout: () => void;
  onNavigate: (tab: TabType) => void;
}

export const UserPortalPage: React.FC<UserPortalPageProps> = ({
  currentUser,
  currentStation,
  onUpdateUserPrefs,
  onLogout,
  onNavigate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editMobile, setEditMobile] = useState(currentUser.phoneNumber || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [delayNoticeMin, setDelayNoticeMin] = useState(5);
  const [showQrExpanded, setShowQrExpanded] = useState(false);

  const directUserUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#user`
    : 'https://ais-dev-a6t7fdyexeqogau3xhaypc-609798137520.asia-east1.run.app/#user';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUserUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserPrefs({
      name: editName.trim() || currentUser.name,
      email: editEmail.trim() || currentUser.email,
      phoneNumber: editMobile.replace(/\D/g, '').slice(0, 10) || currentUser.phoneNumber,
    });
    setIsEditing(false);
  };

  const commuterId = `SR-TN-2026-${(currentUser.phoneNumber || '9876543210').slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-20 pb-32 font-sans selection:bg-[#ff3e00] selection:text-white">
      {/* Subheader Breadcrumb & Direct Link */}
      <div className="bg-[#121212] border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('explore')}
              className="flex items-center gap-1 text-white/70 hover:text-white font-mono uppercase tracking-wider text-[11px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Home</span>
            </button>
            <span className="text-white/20">/</span>
            <span className="font-mono text-[#00f0ff] uppercase font-bold text-[11px]">
              Commuter User Portal & Digital Pass
            </span>
          </div>

          <div className="flex items-center gap-2 bg-black/60 border border-white/15 px-3 py-1.5 font-mono text-[11px]">
            <span className="text-white/40 hidden md:inline">User Page Link:</span>
            <span className="text-[#00f0ff] truncate max-w-[200px] sm:max-w-none">{directUserUrl}</span>
            <button
              onClick={handleCopyLink}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer border ${
                copiedLink
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-white/10 hover:bg-white hover:text-black border-white/20 text-white'
              }`}
            >
              {copiedLink ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Top Digital SmartRail Pass Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#161616] via-[#101010] to-[#080808] border-2 border-white/20 p-6 sm:p-8 shadow-2xl">
          {/* Background Holographic Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff3e00]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Commuter Avatar Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-[#ff3e00] to-amber-500 text-white font-display font-black text-3xl sm:text-4xl flex items-center justify-center border-2 border-white/30 shadow-lg shrink-0">
                {currentUser.avatar || 'CR'}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-500 text-black uppercase tracking-widest">
                    AUTHENTICATED COMMUTER
                  </span>
                  <span className="text-xs font-mono text-[#00f0ff] font-bold">
                    ID: {commuterId}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                  {currentUser.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-mono text-white/70 mt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#ff3e00]">mail</span>
                    {currentUser.email}
                  </span>
                  {currentUser.phoneNumber && (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="material-symbols-outlined text-[15px]">call</span>
                      +91 {currentUser.phoneNumber}
                    </span>
                  )}
                  <span className="text-white/40">
                    Hub: {currentStation.name} ({currentStation.code})
                  </span>
                </div>
              </div>
            </div>

            {/* Smart QR Code for Platform Gate Access */}
            <div className="flex items-center gap-4 bg-black/60 border border-white/20 p-3 self-stretch sm:self-auto justify-between sm:justify-start">
              <div
                onClick={() => setShowQrExpanded(!showQrExpanded)}
                className="cursor-pointer group text-center"
                title="Click to enlarge QR pass"
              >
                {/* Simulated High-Res Railway QR Matrix */}
                <div className="w-16 h-16 bg-white p-1 flex items-center justify-center">
                  <svg viewBox="0 0 33 33" className="w-full h-full fill-black">
                    <rect x="0" y="0" width="9" height="9" />
                    <rect x="2" y="2" width="5" height="5" fill="white" />
                    <rect x="24" y="0" width="9" height="9" />
                    <rect x="26" y="2" width="5" height="5" fill="white" />
                    <rect x="0" y="24" width="9" height="9" />
                    <rect x="2" y="26" width="5" height="5" fill="white" />
                    <rect x="12" y="4" width="3" height="3" />
                    <rect x="18" y="4" width="3" height="3" />
                    <rect x="12" y="12" width="9" height="9" />
                    <rect x="4" y="12" width="4" height="4" />
                    <rect x="24" y="14" width="4" height="4" />
                    <rect x="14" y="24" width="5" height="5" />
                    <rect x="22" y="22" width="6" height="6" />
                  </svg>
                </div>
                <div className="text-[9px] font-mono text-white/50 uppercase mt-1 group-hover:text-white">
                  Gate QR
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Pass Validity</div>
                <div className="text-emerald-400 font-bold uppercase text-[11px]">ACTIVE &bull; 2026/27 SEASON</div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-white/10 hover:bg-white hover:text-black border border-white/20 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors block text-center w-full"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/20 p-6 max-w-md w-full">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="font-display font-black text-lg uppercase text-white">
                  Edit Commuter Profile
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-white/60 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-white/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black border border-white/20 text-white p-2.5 text-sm font-sans focus:border-[#ff3e00] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-white/70 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-black border border-white/20 text-white p-2.5 text-sm font-mono focus:border-[#ff3e00] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-white/70 mb-1">10-Digit Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#ff3e00] font-bold">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-black border border-white/20 text-white p-2.5 pl-12 text-sm font-mono focus:border-[#ff3e00] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-white/20 text-xs font-mono uppercase text-white/70 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#ff3e00] text-white text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#e03700] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bento Grid: Active Commuter Services & Realtime Journeys */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: My Frequent Tamil Nadu Trains */}
          <div className="md:col-span-2 bg-[#101010] border border-white/15 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff3e00] text-[20px]">train</span>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                  My Active Trains & Routes (Tamil Nadu)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('train_search')}
                className="text-[11px] font-mono text-[#ff3e00] hover:underline cursor-pointer font-bold"
              >
                Search More Trains &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {/* Coimbatore to Tuticorin Link Express */}
              <div className="p-3.5 bg-black border border-[#ff3e00]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#ff3e00] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#ff3e00] text-white text-[10px] font-mono font-bold">
                      #16612
                    </span>
                    <span className="text-xs font-bold text-white uppercase">
                      Coimbatore &rarr; Tuticorin Link Express
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 border border-emerald-500/40">
                      ON TIME
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-white/60">
                    Departs Coimbatore (CBE) 08:00 PM &bull; Platform 4 &bull; Stops at Erode, Karur, Dindigul, Madurai, Tuticorin
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('train_details')}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black text-xs font-mono uppercase font-bold tracking-wider cursor-pointer border border-white/20 transition-colors"
                  >
                    Live Status
                  </button>
                  <button
                    onClick={() => onNavigate('map')}
                    className="px-3 py-1.5 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-mono uppercase font-bold tracking-wider cursor-pointer transition-colors"
                  >
                    Platform 4 Map &rarr;
                  </button>
                </div>
              </div>

              {/* Chennai Central to Coimbatore */}
              <div className="p-3.5 bg-black border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-400 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-mono font-bold">
                      #12681
                    </span>
                    <span className="text-xs font-bold text-white uppercase">
                      Chennai Central &rarr; Coimbatore Superfast
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 border border-emerald-500/40">
                      ARRIVING
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-white/60">
                    Scheduled Arrival 06:42 AM &bull; Platform 5 &bull; Concourse Wayfinding Ready
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('map')}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black text-xs font-mono uppercase font-bold tracking-wider cursor-pointer border border-white/20 transition-colors"
                  >
                    3D Twin
                  </button>
                </div>
              </div>

              {/* Pearl City Express */}
              <div className="p-3.5 bg-black border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-mono font-bold">
                      #12693
                    </span>
                    <span className="text-xs font-bold text-white uppercase">
                      Chennai Egmore &rarr; Tuticorin (Pearl City)
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-1.5 py-0.2 border border-amber-500/40">
                      DAILY
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-white/60">
                    Departs 07:30 PM &bull; Direct Southern Railway Corridor to Thoothukudi Port Hub
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('train_search')}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black text-xs font-mono uppercase font-bold tracking-wider cursor-pointer border border-white/20 transition-colors"
                  >
                    Track
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Mobile SMS & Platform Alert Preferences */}
          <div className="bg-[#101010] border border-white/15 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <span className="material-symbols-outlined text-[#00f0ff] text-[20px]">sms</span>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                SMS & Alert Preferences
              </h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  className="accent-[#00f0ff] mt-0.5"
                />
                <div>
                  <div className="text-white font-bold">Live Platform SMS Alerts</div>
                  <div className="text-[10px] text-white/50">
                    Receive instant SMS on +91 {currentUser.phoneNumber || '9876543210'} when train platform changes.
                  </div>
                </div>
              </label>

              <div className="pt-2 border-t border-white/10">
                <div className="text-white/70 mb-1 text-[11px]">Delay Notification Threshold:</div>
                <select
                  value={delayNoticeMin}
                  onChange={(e) => setDelayNoticeMin(Number(e.target.value))}
                  className="w-full bg-black border border-white/20 text-white p-2 text-xs font-mono focus:border-[#00f0ff] outline-none"
                >
                  <option value={5}>Alert if delayed &gt; 5 mins</option>
                  <option value={15}>Alert if delayed &gt; 15 mins</option>
                  <option value={30}>Alert if delayed &gt; 30 mins</option>
                </select>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="text-white/70 mb-1 text-[11px]">Mobility Assistance Route:</div>
                <div className="p-2 bg-black border border-white/10 text-[11px] text-[#ff3e00] font-bold">
                  {currentUser.accessibility || 'Standard'} Mode &bull; {currentUser.avoidStairs ? 'Ramps & Lifts Only' : 'Stairs Allowed'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={onLogout}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sign Out / Switch Commuter
              </button>
            </div>
          </div>
        </div>

        {/* Quick Launchpad to All Features */}
        <div className="bg-[#121212] border border-white/15 p-6">
          <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-3">
            COMMUTER QUICK LAUNCHPAD
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { tab: 'train_search' as TabType, label: 'Where Is My Train?', icon: 'train', color: 'text-[#ff3e00]' },
              { tab: 'map' as TabType, label: '3D Station Twin', icon: 'map', color: 'text-[#00f0ff]' },
              { tab: 'assistant' as TabType, label: 'AI Pilot Copilot', icon: 'smart_toy', color: 'text-amber-400' },
              { tab: 'nearby' as TabType, label: 'Nearby Railway Stations', icon: 'near_me', color: 'text-emerald-400' },
            ].map((btn) => (
              <button
                key={btn.tab}
                onClick={() => onNavigate(btn.tab)}
                className="p-3 bg-black border border-white/15 hover:border-white text-left transition-colors cursor-pointer group"
              >
                <span className={`material-symbols-outlined text-[24px] ${btn.color} mb-1 block group-hover:scale-110 transition-transform`}>
                  {btn.icon}
                </span>
                <span className="text-xs font-bold text-white uppercase block">
                  {btn.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
