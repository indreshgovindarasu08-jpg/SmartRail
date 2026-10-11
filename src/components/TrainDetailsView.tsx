import React, { useState, useEffect } from 'react';
import { TrainStatus, TrainStop, AppLanguage, Station } from '../types';
import { trainDataService, trainEvents } from '../services/railway/trainDataService';
import { MASTER_TRAINS_LIST } from '../data/trainsMasterDB';
import { getTranslation } from '../services/i18n/translations';

interface TrainDetailsViewProps {
  trainNumber: string;
  currentStation: Station;
  onTakeMeToMyTrain: (trainNumber: string, platformNumber?: string) => void;
  onBack: () => void;
  appLanguage?: AppLanguage;
}

export const TrainDetailsView: React.FC<TrainDetailsViewProps> = ({
  trainNumber,
  currentStation,
  onTakeMeToMyTrain,
  onBack,
  appLanguage = 'English',
}) => {
  const [trainStatus, setTrainStatus] = useState<TrainStatus | null>(null);
  const [stops, setStops] = useState<TrainStop[]>([]);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(754); // 12m 34s
  const [freshnessSeconds, setFreshnessSeconds] = useState<number>(32);
  const [simulatedPlatform, setSimulatedPlatform] = useState<string>('Platform 5');
  const t = getTranslation(appLanguage);

  const trainMeta = MASTER_TRAINS_LIST.find((t) => t.number === trainNumber);

  useEffect(() => {
    let active = true;
    trainDataService.getTrainStatus(trainNumber, currentStation.code).then((status) => {
      if (active && status) {
        setTrainStatus(status);
        setSimulatedPlatform(status.assignedPlatform);
        if (status.userStationCountdownSeconds) {
          setCountdownSeconds(status.userStationCountdownSeconds);
        }
      }
    });

    trainDataService.getTrainSchedule(trainNumber).then((sched) => {
      if (active) {
        setStops(sched);
      }
    });

    // Listen to real-time events for this train
    const unsubscribe = trainEvents.on('PLATFORM_CHANGED', (event: any) => {
      if (event.trainNumber === trainNumber) {
        setSimulatedPlatform(event.newPlatform);
        setTrainStatus((prev) => (prev ? { ...prev, assignedPlatform: event.newPlatform } : prev));
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [trainNumber, currentStation.code]);

  // Live countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
      setFreshnessSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins} min ${secs.toString().padStart(2, '0')} sec`;
  };

  const handleSimulatePlatformChange = () => {
    const nextPlat = simulatedPlatform === 'Platform 5' || simulatedPlatform === 'Platform 4' ? 'Platform 6' : 'Platform 4';
    trainDataService.simulatePlatformChange(trainNumber, nextPlat);
  };

  const cleanPlatformNumber = simulatedPlatform.replace(/[^0-9]/g, '') || '5';

  return (
    <div className="w-full min-h-screen bg-[#080808] text-white pt-20 pb-32 font-sans">
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
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
                <span className="w-2 h-2 bg-[#00ff66] inline-block animate-pulse"></span>
                <span className="text-[10px] font-mono text-[#00ff66] font-bold uppercase tracking-widest">
                  LIVE TELEMETRY STREAM
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                {trainMeta?.name || `Train ${trainNumber}`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-mono font-black text-[#ff3e00]">#{trainNumber}</span>
          </div>
        </div>

        {/* SECTION 12: Live Countdown Experience */}
        <section className="bg-gradient-to-br from-[#1c120c] via-[#141414] to-[#0d0d0d] border-2 border-[#ff3e00] p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-[#ff3e00]/10">
          <div className="absolute -top-12 -right-12 text-[160px] font-display font-black text-[#ff3e00]/5 select-none pointer-events-none">
            {cleanPlatformNumber}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#ff3e00] text-black font-mono font-black text-[10px] uppercase tracking-wider">
                  {t.arrivesIn}
                </span>
                <span className="text-xs font-mono text-white/60 uppercase">
                  {currentStation.name} ({currentStation.code})
                </span>
              </div>

              {/* Big Countdown Number */}
              <div className="text-3xl sm:text-5xl font-mono font-black text-white tracking-tight flex items-baseline gap-2">
                <span className="text-[#ff3e00]">{formatCountdown(countdownSeconds)}</span>
              </div>

              <p className="text-xs text-white/70 font-sans flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-400">notifications_active</span>
                <span>{countdownSeconds < 900 ? t.arrivingSoon : 'Train on schedule approaching terminal'}</span>
              </p>
            </div>

            {/* Platform Showcase Badge */}
            <div className="flex flex-col items-center md:items-end justify-center bg-black/70 border border-white/20 p-4 min-w-[150px]">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">{t.platform}</span>
              <span className="text-4xl font-mono font-black text-[#00f0ff]">{cleanPlatformNumber}</span>
              <span className="text-[9px] font-mono text-[#00ff66] uppercase mt-1">CONFIRMED BERTH</span>
            </div>
          </div>

          {/* Data Freshness Indicator (Section 8) */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] font-mono text-white/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full"></span>
              <span className="text-white/80 font-bold uppercase">{t.dataFreshnessLive}</span>
              <span>&bull;</span>
              <span>{t.updatedSecondsAgo} {freshnessSeconds}s ago</span>
            </div>
            <div className="text-[10px] text-white/40 uppercase">
              Source: Southern Railway Salem Division Telemetry
            </div>
          </div>
        </section>

        {/* SECTION 9 & 10: TRAIN + STATION CONNECTION CARD & "TAKE ME TO MY TRAIN" */}
        <section className="bg-[#121212] border border-white/20 p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ff3e00] text-[20px]">hub</span>
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                STATION INDOOR ROUTE CONNECTION
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-white/80">3D DIGITAL TWIN READY</span>
          </div>

          {/* Connection Vector Graphic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/50 p-4 border border-white/10">
            {/* Step 1 */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/40 uppercase">TRAIN TARGET</div>
              <div className="text-sm font-bold text-white">#{trainNumber} &bull; {trainMeta?.destinationCity}</div>
              <div className="text-xs font-mono text-[#00f0ff]">Platform {cleanPlatformNumber} (West Coast Bay)</div>
            </div>

            {/* Step 2 */}
            <div className="space-y-1 md:border-l md:border-white/10 md:pl-4">
              <div className="text-[10px] font-mono text-white/40 uppercase">YOUR POSITION</div>
              <div className="text-sm font-bold text-white">Main Concourse (Level G)</div>
              <div className="text-xs font-mono text-white/60">280 meters walking distance</div>
            </div>

            {/* Step 3 */}
            <div className="space-y-1 md:border-l md:border-white/10 md:pl-4">
              <div className="text-[10px] font-mono text-white/40 uppercase">WAYFINDING PATH</div>
              <div className="text-xs font-mono text-white/80 leading-relaxed">
                Main Hall ➔ Glass Elevator A ➔ FOB L2 ➔ Platform {cleanPlatformNumber}
              </div>
            </div>
          </div>

          {/* Flagship CTA Button */}
          <div className="pt-2">
            <button
              onClick={() => onTakeMeToMyTrain(trainNumber, cleanPlatformNumber)}
              className="w-full py-4 px-6 bg-[#ff3e00] hover:bg-[#e03700] text-white text-sm sm:text-base font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xl shadow-[#ff3e00]/25 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[24px]">directions_walk</span>
              <span>{t.takeMeToMyTrain}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <p className="text-[11px] font-mono text-center text-white/50 mt-2">
              Bridges train tracking with sub-meter 3D station navigation and AR guidance
            </p>
          </div>
        </section>

        {/* SECTION 13: TRAIN JOURNEY SPATIAL TIMELINE */}
        <section className="bg-[#121212] border border-white/15 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ff3e00]">timeline</span>
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-[0.2em]">
                JOURNEY STOPS TIMELINE
              </h2>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase">
              {stops.length} INTERMEDIATE STATIONS
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <div className="relative pl-6 sm:pl-8 space-y-6">
              {/* Vertical timeline line */}
              <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-white/20"></div>

              {stops.map((stop, idx) => {
                const isPassed = stop.status === 'PASSED';
                const isCurrent = stop.status === 'CURRENT' || stop.isUserStation;
                const isUpcoming = stop.status === 'UPCOMING';

                return (
                  <div key={stop.stopSequence} className="relative flex items-start gap-4">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isCurrent
                          ? 'bg-[#ff3e00] border-white ring-4 ring-[#ff3e00]/30 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 border-black'
                          : 'bg-[#181818] border-white/40'
                      }`}
                    ></div>

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-[#161616] p-3 border border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {stop.stationName} ({stop.stationCode})
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#ff3e00] text-black">
                              YOU ARE HERE
                            </span>
                          )}
                          {isPassed && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 bg-emerald-500/10">
                              DEPARTED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-white/50">
                          Arr: <strong className="text-white">{stop.scheduledArrival}</strong> &bull; Dep:{' '}
                          <strong className="text-white">{stop.scheduledDeparture}</strong> &bull; {stop.distanceFromOriginKm} km
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
                        <span className="text-white/60">Platform <strong className="text-[#00f0ff]">{stop.platform}</strong></span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-white/10 text-white/90">
                          {stop.delayMinutes > 0 ? `+${stop.delayMinutes}m` : 'ON TIME'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 11: Realtime Simulation Sandbox for Testing Platform Changes */}
        <section className="p-4 bg-[#101010] border border-dashed border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-[#ff3e00] font-bold uppercase tracking-widest">
                TELEMETRY SIMULATION CONTROLS
              </div>
              <p className="text-xs text-white/70">
                Trigger real-time platform changes or delay alerts to test Section 11 automated re-routing
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulatePlatformChange}
                className="px-3 py-2 bg-[#1c1c1c] border border-white/20 hover:border-[#ff3e00] text-xs font-mono font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">shuffle</span>
                <span>Switch Platform (4 ⇄ 6)</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
