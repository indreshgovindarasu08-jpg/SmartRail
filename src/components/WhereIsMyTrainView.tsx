import React, { useState, useEffect } from 'react';
import { Train, AppLanguage, Station } from '../types';
import { MASTER_TRAINS_LIST } from '../data/trainsMasterDB';
import { trainDataService } from '../services/railway/trainDataService';
import { getTranslation } from '../services/i18n/translations';

interface WhereIsMyTrainViewProps {
  currentStation: Station;
  onSelectTrain: (trainNumber: string) => void;
  onTakeMeToMyTrain: (trainNumber: string, platformNumber?: string) => void;
  onBack: () => void;
  appLanguage?: AppLanguage;
}

export const WhereIsMyTrainView: React.FC<WhereIsMyTrainViewProps> = ({
  currentStation,
  onSelectTrain,
  onTakeMeToMyTrain,
  onBack,
  appLanguage = 'English',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Train[]>(MASTER_TRAINS_LIST);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const t = getTranslation(appLanguage);

  useEffect(() => {
    setRecentSearches(trainDataService.getRecentSearches());
  }, []);

  useEffect(() => {
    let active = true;
    trainDataService.searchTrains(searchQuery).then((matched) => {
      if (active) {
        setResults(matched);
      }
    });
    return () => {
      active = false;
    };
  }, [searchQuery]);

  const handleTrainClick = (trainNumber: string) => {
    trainDataService.addRecentSearch(trainNumber);
    onSelectTrain(trainNumber);
  };

  const getPlatformForTrain = (trainNo: string): string => {
    if (trainNo === '12681') return '5';
    if (trainNo === '20644' || trainNo === '20601') return '1';
    if (trainNo === '12676' || trainNo === '12675' || trainNo === '12635') return '2';
    if (trainNo === '12678' || trainNo === '22476' || trainNo === '12637') return '3';
    if (trainNo === '16381' || trainNo === '16616' || trainNo === '12631') return '4';
    if (trainNo === '06815' || trainNo === '06136') return '6';
    const numInt = parseInt(trainNo.replace(/\D/g, '') || '2', 10);
    return `${(numInt % 6) + 1}`;
  };

  const getStatusBadge = (trainNo: string) => {
    if (trainNo === '12681') {
      return (
        <span className="px-2 py-0.5 text-[9px] font-black font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
          ARRIVING • ON TIME
        </span>
      );
    }
    if (trainNo === '20644') {
      return (
        <span className="px-2 py-0.5 text-[9px] font-black font-mono uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/40">
          ON TIME (06:00 AM)
        </span>
      );
    }
    if (trainNo === '16381') {
      return (
        <span className="px-2 py-0.5 text-[9px] font-black font-mono uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
          DELAYED +15M
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[9px] font-black font-mono uppercase tracking-wider bg-white/10 text-white/80 border border-white/20">
        RUNNING
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#080808] text-white pt-20 pb-28 font-sans">
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
        {/* Top Breadcrumb Header */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-[#121212] border border-white/15 text-white/70 hover:text-white hover:border-[#ff3e00] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ff3e00] inline-block animate-ping"></span>
                <span className="text-[10px] font-mono text-[#ff3e00] font-bold uppercase tracking-widest">
                  TRAIN INTELLIGENCE LAYER
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                {t.whereIsMyTrain}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[9px] font-mono uppercase text-white/50 tracking-widest">ACTIVE HUB</span>
            <span className="text-xs font-bold uppercase text-white">{currentStation.name} ({currentStation.code})</span>
          </div>
        </div>

        {/* Big Search Box */}
        <div className="relative mb-6">
          <div className="relative flex items-center">
            <span className="absolute left-4 material-symbols-outlined text-white/40 text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              autoFocus
              className="w-full pl-12 pr-10 py-4 bg-[#121212] border border-white/20 text-white placeholder-white/40 text-sm font-sans focus:outline-none focus:border-[#ff3e00] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-white/40 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          <p className="text-[11px] font-mono text-white/40 mt-2 px-1">
            Search by train number (e.g. 12681, 20644), train name (Kovai, Vande Bharat), or destination
          </p>
        </div>

        {/* Recent Searches Pills */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">history</span>
              {t.recentSearches}
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((trainNo) => {
                const train = MASTER_TRAINS_LIST.find((t) => t.number === trainNo);
                return (
                  <button
                    key={trainNo}
                    onClick={() => handleTrainClick(trainNo)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-white/15 hover:border-[#ff3e00] text-xs font-mono font-bold text-white transition-colors cursor-pointer"
                  >
                    <span className="text-[#ff3e00]">#{trainNo}</span>
                    <span className="text-white/70 text-[11px] font-sans">
                      {train ? train.name.split(' ')[0] : 'Express'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 uppercase tracking-wider pb-1">
            <span>AVAILABLE TRAINS ({results.length})</span>
            <span>PLATFORM &bull; ACTION</span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-[#121212] border border-white/10">
              <span className="material-symbols-outlined text-4xl text-white/20 mb-2">search_off</span>
              <p className="text-sm font-bold text-white uppercase">No trains matched "{searchQuery}"</p>
              <p className="text-xs text-white/50 mt-1">Try entering 12681, 20644, Kovai, or Coimbatore</p>
            </div>
          ) : (
            results.map((train) => {
              const platform = getPlatformForTrain(train.number);
              const isFlagship = train.number === '12681';

              return (
                <div
                  key={train.id}
                  className={`p-4 sm:p-5 bg-[#121212] border transition-all ${
                    isFlagship
                      ? 'border-[#ff3e00]/60 hover:border-[#ff3e00] bg-gradient-to-r from-[#161210] to-[#121212]'
                      : 'border-white/15 hover:border-white/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Train Info */}
                    <div className="space-y-1.5 cursor-pointer flex-1" onClick={() => handleTrainClick(train.number)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg sm:text-xl font-mono font-black text-[#ff3e00] tracking-tight">
                          {train.number}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                          {train.name}
                        </span>
                        {getStatusBadge(train.number)}
                      </div>

                      {/* Route Path */}
                      <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                        <span className="text-white font-bold">{train.originCity} ({train.originCode})</span>
                        <span className="material-symbols-outlined text-[14px] text-white/40">arrow_forward</span>
                        <span className="text-white font-bold">{train.destinationCity} ({train.destinationCode})</span>
                        <span className="text-white/40">&bull;</span>
                        <span className="text-white/50">{train.totalDurationFormatted}</span>
                      </div>

                      {/* Departure/Arrival Times */}
                      <div className="flex items-center gap-4 text-[11px] font-mono text-white/50 pt-0.5">
                        <span>Dep: <strong className="text-white">{train.departureTime}</strong></span>
                        <span>Arr: <strong className="text-white">{train.arrivalTime}</strong></span>
                        <span>Type: <strong className="text-white/80">{train.type}</strong></span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                      <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 border border-white/10">
                        <span className="text-[10px] font-mono text-white/50 uppercase">Platform</span>
                        <span className="text-sm font-mono font-black text-[#00f0ff]">{platform}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTrainClick(train.number)}
                          className="px-3 py-2 bg-[#181818] border border-white/20 hover:border-white text-[11px] font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onTakeMeToMyTrain(train.number, platform)}
                          className="px-3.5 py-2 bg-[#ff3e00] hover:bg-[#e03700] text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-[#ff3e00]/20"
                        >
                          <span>Take Me</span>
                          <span className="material-symbols-outlined text-[14px]">directions_walk</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
