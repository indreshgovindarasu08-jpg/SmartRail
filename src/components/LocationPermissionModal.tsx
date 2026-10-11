import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, ShieldCheck, Compass, ArrowRight, X, AlertCircle } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  isDetecting: boolean;
  errorMessage?: string | null;
  onAllow: () => void;
  onManualSelect: () => void;
  onClose: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  isDetecting,
  errorMessage,
  onAllow,
  onManualSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="location-permission-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-permission-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          id="location-permission-card"
          className="relative w-full max-w-lg bg-[#0d1527] border border-[#00f0ff]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.15)] text-slate-100 overflow-hidden"
        >
          {/* Subtle Cyberpunk grid & ambient glow background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#a855f7]/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

          {/* Close button */}
          <button
            id="close-location-permission-modal"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header with Radar Ping Animation */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] shrink-0">
              <MapPin className="w-7 h-7" />
              {/* Radar pulse ripples */}
              <span className="absolute inset-0 rounded-2xl border border-[#00f0ff]/60 animate-ping opacity-30" />
              <span className="absolute -inset-1 rounded-2xl border border-[#00f0ff]/20 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-mono font-medium tracking-wide uppercase mb-1">
                <Compass className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                Spatial Discovery Engine
              </div>
              <h2 id="location-permission-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Enable Location
              </h2>
            </div>
          </div>

          {/* Main Description */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-sans">
            Allow SmartRail Navigator to find railway stations near you and provide accurate navigation.
          </p>

          {/* Error notice if user denied previously */}
          {errorMessage && (
            <div
              id="location-permission-error-banner"
              className="flex items-start gap-3 p-3.5 mb-6 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">Location Access Notice</p>
                <p className="text-rose-200/80 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Value props / Privacy guarantees */}
          <div className="grid grid-cols-1 gap-2.5 p-3.5 mb-6 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Navigation className="w-4 h-4 text-[#00f0ff] shrink-0" />
              <span>Instant auto-detection of your nearest station platform & hub</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Seamless switch to 3D indoor positioning once inside concourse</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Privacy protected: GPS processed locally and never permanently stored</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="btn-allow-location-primary"
              onClick={onAllow}
              disabled={isDetecting}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#00f0ff] hover:bg-[#38f8ff] text-slate-950 font-semibold text-sm transition-all duration-200 shadow-[0_0_25px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDetecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 fill-current" />
                  <span>Allow Location</span>
                </>
              )}
            </button>

            <button
              id="btn-choose-station-manually"
              onClick={onManualSelect}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white font-medium text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <span>Choose Station Manually</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
