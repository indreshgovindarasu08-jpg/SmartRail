import React, { useEffect, useState } from 'react';
import { RealtimeRailwayEvent, AppLanguage } from '../types';
import { trainEvents } from '../services/railway/trainDataService';
import { getTranslation } from '../services/i18n/translations';

interface PlatformChangeAlertModalProps {
  onRecalculateRoute?: (newPlatform: string) => void;
  appLanguage?: AppLanguage;
}

export const PlatformChangeAlertModal: React.FC<PlatformChangeAlertModalProps> = ({
  onRecalculateRoute,
  appLanguage = 'English',
}) => {
  const [activeAlert, setActiveAlert] = useState<RealtimeRailwayEvent | null>(null);
  const t = getTranslation(appLanguage);

  useEffect(() => {
    const unsubscribe = trainEvents.on('PLATFORM_CHANGED', (event: RealtimeRailwayEvent) => {
      setActiveAlert(event);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!activeAlert) return null;

  const handleContinue = () => {
    if (activeAlert.newPlatform && onRecalculateRoute) {
      onRecalculateRoute(activeAlert.newPlatform);
    }
    setActiveAlert(null);
  };

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md z-50 animate-bounce-short">
      <div className="bg-[#1c140e] border-2 border-[#ff3e00] p-5 shadow-2xl shadow-black/80 text-white space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff3e00] text-[24px] animate-pulse">
              warning
            </span>
            <span className="text-xs font-mono font-black text-[#ff3e00] uppercase tracking-widest">
              {t.platformChangedTitle}
            </span>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-white/40 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Message */}
        <p className="text-sm font-sans text-white/90 leading-snug">
          {t.platformChangedDesc}{' '}
          <strong className="text-[#00f0ff] font-mono text-base">{activeAlert.newPlatform}</strong> (was{' '}
          <span className="line-through text-white/50">{activeAlert.originalPlatform}</span>).
        </p>

        <p className="text-[11px] font-mono text-white/60">
          Your indoor walking path and 3D elevator route have been automatically updated.
        </p>

        {/* Action button */}
        <div className="pt-1">
          <button
            onClick={handleContinue}
            className="w-full py-2.5 px-4 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{t.continueNavigation}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
