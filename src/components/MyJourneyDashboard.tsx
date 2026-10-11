import React, { useState, useEffect } from 'react';
import { ActiveJourneyState, AppLanguage, Station } from '../types';
import { trainEvents, trainDataService } from '../services/railway/trainDataService';
import { getTranslation } from '../services/i18n/translations';

interface MyJourneyDashboardProps {
  currentStation: Station;
  onTakeMeToMyTrain: (trainNumber: string, platformNumber?: string) => void;
  onExploreOtherTrains: () => void;
  appLanguage?: AppLanguage;
}

export const MyJourneyDashboard: React.FC<MyJourneyDashboardProps> = ({
  currentStation,
  onTakeMeToMyTrain,
  onExploreOtherTrains,
  appLanguage = 'English',
}) => {
  const [journey, setJourney] = useState<ActiveJourneyState>({
    trainNumber: '12681',
    trainName: 'Chennai Central - Coimbatore Superfast Express',
    source: 'Chennai Central (MAS)',
    destination: 'Coimbatore Junction (CBE)',
    userStationCode: 'CBE',
    userStationName: 'Coimbatore Junction',
    eta: '06:42 AM',
    platform: 'Platform 5',
    platformConfirmed: true,
    status: 'ROUTE_READY',
    countdownSeconds: 754,
    lastUpdated: new Date().toISOString(),
  });

  const t = getTranslation(appLanguage);

  useEffect(() => {
    const timer = setInterval(() => {
      setJourney((prev) => ({
        ...prev,
        countdownSeconds: prev.countdownSeconds > 1 ? prev.countdownSeconds - 1 : 0,
      }));
    }, 1000);

    const unsubscribe = trainEvents.on('PLATFORM_CHANGED', (event: any) => {
      if (event.trainNumber === journey.trainNumber) {
        setJourney((prev) => ({
          ...prev,
          platform: event.newPlatform,
        }));
      }
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [journey.trainNumber]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const steps = [
    { label: 'Train Found', done: true },
    { label: 'Running', done: true },
    { label: `Platform Assigned (${journey.platform})`, done: true },
    { label: 'Station Route Ready', done: true },
    { label: 'Boarding In Progress', done: false },
  ];

  return (
    <div className="w-full min-h-screen bg-[#080808] text-white pt-20 pb-32 font-sans">
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff3e00] inline-block animate-ping"></span>
              <span className="text-[10px] font-mono text-[#ff3e00] font-bold uppercase tracking-widest">
                PERSONAL COMMUTER FLIGHT DECK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
              {t.myJourney}
            </h1>
          </div>

          <button
            onClick={onExploreOtherTrains}
            className="px-3 py-1.5 bg-[#141414] border border-white/20 hover:border-white text-xs font-mono text-white transition-colors cursor-pointer"
          >
            Switch Train
          </button>
        </div>

        {/* Live Journey Progress Milestone Card */}
        <div className="bg-[#121212] border border-white/20 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-mono font-black text-[#ff3e00]">
                #{journey.trainNumber}
              </div>
              <div className="text-base sm:text-lg font-bold text-white">
                {journey.trainName}
              </div>
              <div className="text-xs font-mono text-white/60 mt-1">
                {journey.source} &rarr; {journey.destination}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/60 p-4 border border-white/10 self-start sm:self-auto">
              <div className="text-center">
                <div className="text-[10px] font-mono text-white/50 uppercase">ETA</div>
                <div className="text-lg font-mono font-bold text-white">{journey.eta}</div>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="text-[10px] font-mono text-white/50 uppercase">COUNTDOWN</div>
                <div className="text-lg font-mono font-black text-[#00ff66]">
                  {formatCountdown(journey.countdownSeconds)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 24 Milestones */}
          <div className="pt-2">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-3">
              JOURNEY STAGES
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {steps.map((s, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 border text-xs font-mono flex items-center gap-2 ${
                    s.done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {s.done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="text-[11px] truncate">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => onTakeMeToMyTrain(journey.trainNumber, journey.platform.replace(/[^0-9]/g, ''))}
              className="w-full py-4 px-6 bg-[#ff3e00] hover:bg-[#e03700] text-white text-sm sm:text-base font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xl shadow-[#ff3e00]/20"
            >
              <span className="material-symbols-outlined text-[22px]">directions_walk</span>
              <span>{t.startStationNavigation}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
