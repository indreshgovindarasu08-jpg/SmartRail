import React, { useState, useEffect } from 'react';
import { Station, AppLanguage, UserPreferences } from '../types';
import { getTranslation } from '../services/i18n/translations';
import { MASTER_TRAINS_LIST } from '../data/trainsMasterDB';
import { SmartRailLogo } from './SmartRailLogo';

interface HomeScreenProps {
  currentStation: Station;
  onOpenTrainSearch: () => void;
  onOpenStationNavigation: (targetPlatform?: string) => void;
  onOpenNearbyStations: () => void;
  onOpenAI: () => void;
  onSelectTrain: (trainNumber: string) => void;
  onTakeMeToMyTrain: (trainNumber: string, platformNumber?: string) => void;
  appLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  currentUser?: UserPreferences;
  onOpenAuth?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentStation,
  onOpenTrainSearch,
  onOpenStationNavigation,
  onOpenNearbyStations,
  onOpenAI,
  onSelectTrain,
  onTakeMeToMyTrain,
  appLanguage,
  onLanguageChange,
  currentUser,
  onOpenAuth,
}) => {
  const [tickerSeconds, setTickerSeconds] = useState<number>(754);
  const t = getTranslation(appLanguage);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerSeconds((prev) => (prev > 1 ? prev - 1 : 754));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const languages: AppLanguage[] = [
    'English',
    'Tamil',
    'Hindi',
    'Malayalam',
    'Telugu',
    'Kannada',
  ];

  return (
    <div className="w-full min-h-screen bg-[#080808] text-white pt-20 pb-28 font-sans">
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Top Hub Bar with Brand Logo & Language Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-3.5">
            <SmartRailLogo size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-[#00ff66] inline-block animate-pulse"></span>
                <span className="text-[10px] font-mono text-[#00ff66] font-bold uppercase tracking-widest">
                  TAMIL NADU SPATIAL RAILWAY HUB ONLINE
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
                {t.appName}
              </h1>
              <p className="text-xs sm:text-sm text-white/60 font-sans mt-0.5 max-w-xl">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Language Switcher (Section 27) */}
          <div className="flex items-center gap-2 bg-[#121212] p-1.5 border border-white/15 self-start sm:self-auto">
            <span className="material-symbols-outlined text-[16px] text-white/40 pl-1">translate</span>
            <select
              value={appLanguage}
              onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer pr-2"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-[#181818] text-white">
                  {lang === 'Tamil'
                    ? 'தமிழ் (Tamil)'
                    : lang === 'Hindi'
                    ? 'हिन्दी (Hindi)'
                    : lang === 'Malayalam'
                    ? 'മലയാളം (Malayalam)'
                    : lang === 'Telugu'
                    ? 'తెలుగు (Telugu)'
                    : lang === 'Kannada'
                    ? 'ಕನ್ನಡ (Kannada)'
                    : 'English'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 3: Contextual Station Capability Card */}
        <div className="bg-[#121212] border border-white/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff3e00]/10 border border-[#ff3e00]/40 flex items-center justify-center text-[#ff3e00]">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/40 uppercase">ACTIVE HUB</div>
              <div className="text-sm sm:text-base font-bold text-white">
                {currentStation.name} ({currentStation.code})
              </div>
              <div className="text-[11px] text-white/60 font-mono">
                Salem Division &bull; 6 Platforms &bull; Step-Free Access
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 bg-black/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
              3D TWIN &bull; READY
            </span>
            <span className="px-2 py-1 bg-black/60 border border-sky-500/30 text-sky-400 text-[10px] font-mono font-bold">
              AR SPATIAL &bull; READY
            </span>
            <span className="px-2 py-1 bg-black/60 border border-[#ff3e00]/30 text-[#ff3e00] text-[10px] font-mono font-bold">
              LIVE TELEMETRY
            </span>
            <button
              onClick={onOpenNearbyStations}
              className="px-2.5 py-1 bg-[#181818] hover:bg-white/10 text-white text-[11px] font-mono border border-white/20 transition-colors cursor-pointer"
            >
              {t.switchStation} &rarr;
            </button>
          </div>
        </div>

        {/* Popular Tamil Nadu Express Corridors (Including Coimbatore to Tuticorin) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-white/50 tracking-wider">
            <span>POPULAR TAMIL NADU TRAIN CORRIDORS</span>
            <button
              onClick={onOpenTrainSearch}
              className="text-[#ff3e00] hover:underline cursor-pointer flex items-center gap-1 font-bold"
            >
              <span>Search All Trains</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <button
              onClick={() => onSelectTrain('16612')}
              className="p-2.5 bg-[#121212] hover:bg-white/10 border border-white/15 hover:border-[#ff3e00] text-left transition-colors cursor-pointer group"
            >
              <div className="text-[9px] text-[#ff3e00] font-bold">#16612 • LINK EXP</div>
              <div className="text-white font-bold truncate group-hover:text-[#ff3e00]">CBE &rarr; Tuticorin</div>
              <div className="text-[9px] text-white/50">08:00 PM • PF 4</div>
            </button>
            <button
              onClick={() => onSelectTrain('12681')}
              className="p-2.5 bg-[#121212] hover:bg-white/10 border border-white/15 hover:border-emerald-400 text-left transition-colors cursor-pointer group"
            >
              <div className="text-[9px] text-emerald-400 font-bold">#12681 • ARRIVING</div>
              <div className="text-white font-bold truncate group-hover:text-emerald-400">Chennai &rarr; CBE</div>
              <div className="text-[9px] text-white/50">06:42 AM • PF 5</div>
            </button>
            <button
              onClick={() => onSelectTrain('20644')}
              className="p-2.5 bg-[#121212] hover:bg-white/10 border border-white/15 hover:border-sky-400 text-left transition-colors cursor-pointer group"
            >
              <div className="text-[9px] text-sky-400 font-bold">#20644 • VANDE BHARAT</div>
              <div className="text-white font-bold truncate group-hover:text-sky-400">CBE &rarr; Chennai Central</div>
              <div className="text-[9px] text-white/50">06:00 AM • PF 1</div>
            </button>
            <button
              onClick={() => onSelectTrain('12693')}
              className="p-2.5 bg-[#121212] hover:bg-white/10 border border-white/15 hover:border-amber-400 text-left transition-colors cursor-pointer group"
            >
              <div className="text-[9px] text-amber-400 font-bold">#12693 • PEARL CITY</div>
              <div className="text-white font-bold truncate group-hover:text-amber-400">Chennai &rarr; Tuticorin</div>
              <div className="text-[9px] text-white/50">07:30 PM • PF 4</div>
            </button>
          </div>
        </div>

        {/* Dedicated Commuter Login & Registration Page Banner */}
        {onOpenAuth && (
          <div
            onClick={onOpenAuth}
            className={`p-3.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
              currentUser?.isLoggedIn
                ? 'bg-gradient-to-r from-[#0c1810] to-[#121212] border-emerald-500/40 hover:border-emerald-400'
                : 'bg-gradient-to-r from-[#1a1208] to-[#121212] border-amber-500/40 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-[24px] ${currentUser?.isLoggedIn ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentUser?.isLoggedIn ? 'verified_user' : 'badge'}
              </span>
              <div>
                <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <span>{currentUser?.isLoggedIn ? `Commuter Account: ${currentUser.name}` : 'Commuter Login & Registration Page'}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 border ${currentUser?.isLoggedIn ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-[#ff3e00]/20 text-[#ff3e00] border-[#ff3e00]/40'}`}>
                    {currentUser?.isLoggedIn ? 'LOGGED IN' : 'SEPARATE PAGE'}
                  </span>
                </div>
                <div className="text-[10px] text-white/60 font-mono mt-0.5">
                  {currentUser?.isLoggedIn
                    ? `Registered email: ${currentUser.email} • Mobile: +91 ${currentUser.phoneNumber || '9876543210'} (Click to open Login Page & Switch Account)`
                    : 'Register with 10-digit mobile number & email for live SMS platform notices, e-passes & personalized routing.'}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1.5 text-black text-[10px] font-mono font-black uppercase tracking-wider shrink-0 text-center ${currentUser?.isLoggedIn ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-amber-500 hover:bg-amber-400'}`}>
              {currentUser?.isLoggedIn ? 'Manage Account / Switch User →' : 'Open Login Page →'}
            </span>
          </div>
        )}

        {/* FEATURED REALTIME TRAIN TICKER & CTA */}
        <div className="bg-gradient-to-r from-[#1c120c] via-[#141414] to-[#121212] border border-[#ff3e00] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#00ff66] rounded-full animate-ping"></span>
              <span className="text-[10px] font-mono text-[#00ff66] font-bold uppercase tracking-widest">
                INCOMING FLAGSHIP SERVICE
              </span>
            </div>
            <div className="text-[10px] font-mono text-white/50 uppercase">
              UPDATED 32s AGO &bull; LIVE FEED
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-black text-[#ff3e00]">#12681</span>
                <span className="text-sm sm:text-base font-bold text-white">
                  Chennai Central &rarr; Coimbatore Superfast
                </span>
              </div>
              <div className="text-xs font-mono text-white/70">
                Approaching Tiruppur &bull; On Time &bull; Scheduled 06:42 AM
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/60 px-4 py-2.5 border border-white/10 self-start md:self-auto">
              <div>
                <div className="text-[9px] font-mono text-white/40 uppercase">ARRIVES IN</div>
                <div className="text-lg font-mono font-black text-[#ff3e00]">
                  {formatCountdown(tickerSeconds)}
                </div>
              </div>
              <div className="h-6 w-px bg-white/20"></div>
              <div>
                <div className="text-[9px] font-mono text-white/40 uppercase">PLATFORM</div>
                <div className="text-lg font-mono font-black text-[#00f0ff]">5</div>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={() => onTakeMeToMyTrain('12681', '5')}
              className="w-full sm:w-auto px-5 py-3 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#ff3e00]/20"
            >
              <span className="material-symbols-outlined text-[18px]">directions_walk</span>
              <span>{t.takeMeToMyTrain}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              onClick={() => onSelectTrain('12681')}
              className="w-full sm:w-auto px-4 py-3 bg-[#181818] hover:bg-[#222] border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              View Full Timeline
            </button>
          </div>
        </div>

        {/* SECTION 3: THREE PRIMARY ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: FIND MY TRAIN */}
          <div
            onClick={onOpenTrainSearch}
            className="p-5 bg-[#121212] border border-white/15 hover:border-[#ff3e00] transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white/5 border border-white/10 group-hover:border-[#ff3e00] group-hover:bg-[#ff3e00]/10 transition-colors flex items-center justify-center text-[#ff3e00]">
                <span className="material-symbols-outlined text-[26px]">train</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#ff3e00] transition-colors uppercase font-display">
                  {t.findMyTrain}
                </h3>
                <p className="text-xs text-white/60 font-sans mt-1 leading-relaxed">
                  Instant train lookup by number, name, source, or destination with live countdown and platform berth status.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-mono font-bold text-[#ff3e00] gap-1 group-hover:translate-x-1 transition-transform">
              <span>SEARCH TRAINS</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>

          {/* Action 2: NAVIGATE INSIDE STATION */}
          <div
            onClick={() => onOpenStationNavigation()}
            className="p-5 bg-[#121212] border border-white/15 hover:border-[#00f0ff] transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white/5 border border-white/10 group-hover:border-[#00f0ff] group-hover:bg-[#00f0ff]/10 transition-colors flex items-center justify-center text-[#00f0ff]">
                <span className="material-symbols-outlined text-[26px]">view_in_ar</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#00f0ff] transition-colors uppercase font-display">
                  {t.navigateInsideStation}
                </h3>
                <p className="text-xs text-white/60 font-sans mt-1 leading-relaxed">
                  Interactive 3D digital twin of Coimbatore Junction with FOB skywalks, 4 glass elevators, and AR wayfinding.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-mono font-bold text-[#00f0ff] gap-1 group-hover:translate-x-1 transition-transform">
              <span>LAUNCH 3D TWIN</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>

          {/* Action 3: NEARBY & ALL TAMIL NADU HUBS */}
          <div
            onClick={onOpenNearbyStations}
            className="p-5 bg-[#121212] border border-white/15 hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white/5 border border-white/10 group-hover:border-emerald-400 group-hover:bg-emerald-500/10 transition-colors flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-[26px]">near_me</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors uppercase font-display">
                  {t.nearbyStations} &bull; All Tamil Nadu
                </h3>
                <p className="text-xs text-white/60 font-sans mt-1 leading-relaxed">
                  Access every railway station across all Tamil Nadu divisions: Chennai, Salem, Madurai, Trichy, Palakkad &amp; TVC.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-mono font-bold text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
              <span>EXPLORE ALL STATIONS</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Quick Launcher Banner */}
        <div className="p-4 sm:p-5 bg-[#141414] border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white">SmartRail Spatial Navigation AI</div>
              <div className="text-xs text-white/60 font-sans">
                Ask about platforms, step-free routes, coffee, waiting halls, or Nilgiri toy train
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAI}
            className="px-4 py-2 bg-[#202020] hover:bg-white/10 border border-white/20 text-xs font-mono font-bold text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            Ask AI Assistant &rarr;
          </button>
        </div>
      </main>
    </div>
  );
};
