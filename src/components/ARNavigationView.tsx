import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Station, StationPOI, ActiveRoute, NavigationStep } from '../types';

interface ARNavigationViewProps {
  station: Station;
  targetPOI?: StationPOI;
  activeRoute?: ActiveRoute | null;
  onClose: () => void;
}

export const ARNavigationView: React.FC<ARNavigationViewProps> = ({
  station,
  targetPOI,
  activeRoute,
  onClose,
}) => {
  const destination: StationPOI = useMemo(() => {
    return (
      targetPOI ||
      activeRoute?.destination ||
      station.pois.find((p) => p.id === 'platform-5') ||
      station.pois[0]
    );
  }, [targetPOI, activeRoute, station.pois]);

  // Derive or construct meaningful step-by-step guidance
  const steps: NavigationStep[] = useMemo(() => {
    if (activeRoute?.steps && activeRoute.steps.length > 0) {
      return activeRoute.steps;
    }

    // Default rich navigation steps if no route object was pre-built
    const isUpper = destination.floor === 'L2';
    const isLower = destination.floor === 'L1';
    const isElevatorNeeded = isUpper || isLower;
    const isRightWing = (destination.x || 50) >= 50;

    const generated: NavigationStep[] = [
      {
        id: 'ar-step-1',
        instruction: 'Head straight 40m along Main Concourse toward Information Booth',
        distanceMeters: 40,
        icon: 'straight',
        floor: 'G',
        actionType: 'straight',
        arHint: 'Follow the glowing holographic floor path ahead.',
      },
    ];

    if (isElevatorNeeded) {
      generated.push({
        id: 'ar-step-2',
        instruction: `Take Glass Elevator A to Level ${destination.floor}`,
        distanceMeters: 20,
        icon: 'elevator',
        floor: destination.floor,
        isElevator: true,
        actionType: 'elevator',
        arHint: `Elevator bank visible on your ${isRightWing ? 'right' : 'left'}.`,
      });
      generated.push({
        id: 'ar-step-3',
        instruction: `Exit elevator on Level ${destination.floor} and turn ${isRightWing ? 'right' : 'left'} into concourse`,
        distanceMeters: 35,
        icon: isRightWing ? 'turn_right' : 'turn_left',
        floor: destination.floor,
        actionType: isRightWing ? 'turn_right' : 'turn_left',
        arHint: `Follow overhead signage toward ${destination.name}.`,
      });
    } else {
      generated.push({
        id: 'ar-step-2',
        instruction: `Turn ${isRightWing ? 'right' : 'left'} at track entry gate towards ${destination.name}`,
        distanceMeters: 45,
        icon: isRightWing ? 'turn_right' : 'turn_left',
        floor: destination.floor,
        actionType: isRightWing ? 'turn_right' : 'turn_left',
        arHint: 'Gate line visible directly ahead.',
      });
      generated.push({
        id: 'ar-step-3',
        instruction: `Continue straight 30m along track access aisle`,
        distanceMeters: 30,
        icon: 'straight',
        floor: destination.floor,
        actionType: 'straight',
        arHint: 'Stay inside designated pedestrian walking lane.',
      });
    }

    generated.push({
      id: 'ar-step-4',
      instruction: `Arrive at ${destination.name}`,
      distanceMeters: 10,
      icon: 'place',
      floor: destination.floor,
      actionType: 'arrive',
      arHint: `Destination reached on Level ${destination.floor}.`,
    });

    return generated;
  }, [activeRoute, destination]);

  const totalSteps = steps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isArrived, setIsArrived] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [heading, setHeading] = useState(42);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStepData = steps[currentStepIndex] || steps[0];

  // Calculate remaining distance dynamically based on step index
  const initialDistance = activeRoute?.distanceMeters || 135;
  const distanceRemaining = useMemo(() => {
    if (isArrived) return 0;
    const remainingStepsDistance = steps
      .slice(currentStepIndex)
      .reduce((sum, s) => sum + (s.distanceMeters || 25), 0);
    return Math.max(5, remainingStepsDistance);
  }, [steps, currentStepIndex, isArrived]);

  // Voice speech synthesis helper
  const speakInstruction = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Benign fallback
    }
  };

  // Announce initial step on mount
  useEffect(() => {
    if (currentStepData) {
      speakInstruction(`AR Navigation started. ${currentStepData.instruction}`);
    }
  }, []);

  // Request actual camera stream if user opts in
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (useRealCamera && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setCameraError(true);
          setUseRealCamera(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useRealCamera]);

  // Compass heading oscillation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeading((h) => (h + 1) % 360);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  // Handler for Next Step
  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = steps[nextIdx];
      speakInstruction(nextStep.instruction);
    } else {
      setIsArrived(true);
      speakInstruction(`You have arrived at ${destination.name}`);
    }
  };

  // Handler for Previous Step
  const handlePrevStep = () => {
    if (isArrived) {
      setIsArrived(false);
      return;
    }
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const prevStep = steps[prevIdx];
      speakInstruction(prevStep.instruction);
    }
  };

  // Handler for Jumping Directly to a Step
  const handleSelectStep = (idx: number) => {
    setIsArrived(false);
    setCurrentStepIndex(idx);
    const step = steps[idx];
    if (step) {
      speakInstruction(step.instruction);
    }
  };

  // Restart Navigation Route
  const handleRestartRoute = () => {
    setIsArrived(false);
    setCurrentStepIndex(0);
    speakInstruction(steps[0].instruction);
  };

  // Determine directional icon based on current step
  const getDirectionalIcon = (iconName?: string) => {
    switch (iconName) {
      case 'turn_right':
        return 'turn_right';
      case 'turn_left':
        return 'turn_left';
      case 'elevator':
      case 'arrow_upward':
        return 'elevator';
      case 'place':
        return 'place';
      default:
        return 'navigation';
    }
  };

  return (
    <div
      id="ar-wayfinder-container"
      className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden select-none font-sans"
    >
      {/* Background: Real Video or Architectural Transit Simulation */}
      {useRealCamera ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden">
          {/* Simulated 3D Transit Concourse Hall */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff3e00]/25 via-[#181818] to-black" />

          {/* Perspective grid floor */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255, 62, 0, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              transform: 'perspective(500px) rotateX(60deg) translateY(100px)',
              transformOrigin: 'bottom center',
            }}
          />

          {/* AR Ground Path Guidance Laser Chevrons */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-44 pointer-events-none">
            <div className="w-2.5 h-2.5 bg-[#ff3e00] animate-ping mb-5" />
            <div className="w-3.5 h-3.5 bg-[#ff3e00] opacity-80 mb-5 shadow-[0_0_12px_#ff3e00]" />
            <div className="w-5 h-5 bg-[#ff3e00] opacity-90 mb-6 shadow-[0_0_16px_#ff3e00]" />
            <div className="w-7 h-7 bg-[#ff3e00] shadow-[0_0_20px_#ff3e00]" />
          </div>
        </div>
      )}

      {/* Floating 3D Waypoint / Directional Chevron */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="animate-bounce flex flex-col items-center">
          {/* Destination Header Pill */}
          <div className="px-4 py-2 bg-black/90 border-2 border-[#ff3e00] shadow-[0_0_25px_rgba(255,62,0,0.6)] flex items-center gap-2.5 mb-2 backdrop-blur-md">
            <span className="material-symbols-outlined text-[#ff3e00] text-[20px]">
              {destination.icon || 'place'}
            </span>
            <div>
              <div className="text-xs font-display font-black text-white uppercase tracking-wider">
                {destination.name}
              </div>
              <div className="text-[10px] font-mono text-white/80 uppercase">
                {distanceRemaining}M REMAINING // LEVEL {currentStepData?.floor || destination.floor}
              </div>
            </div>
          </div>

          {/* Dynamic Floating Action Chevron */}
          <div className="w-13 h-13 bg-[#ff3e00] text-white flex items-center justify-center border-2 border-white shadow-[0_0_20px_rgba(255,62,0,0.8)]">
            <span className="material-symbols-outlined text-[30px] font-bold">
              {getDirectionalIcon(currentStepData?.icon)}
            </span>
          </div>
        </div>
      </div>

      {/* AR HUD Header Overlay */}
      <header
        id="ar-telemetry-header"
        className="relative z-20 flex justify-between items-center px-4 py-3.5 sm:px-6 bg-black/85 border-b border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <button
            id="ar-back-button"
            onClick={onClose}
            className="p-2 bg-[#121212] border border-white/20 text-white hover:bg-white hover:text-black cursor-pointer transition-colors active:scale-95"
            aria-label="Exit AR mode"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#ff3e00] animate-ping" />
              <span>AR WAYFINDER TELEMETRY</span>
            </div>
            <div className="text-[10px] font-mono text-white/50 uppercase">
              {station.name} // HEADING {heading}° NE // {currentStepIndex + 1} OF {totalSteps} STEPS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Mute Toggle */}
          <button
            id="ar-voice-toggle"
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (nextMute && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2 border transition-all cursor-pointer flex items-center justify-center ${
              !isMuted
                ? 'bg-white text-black border-white'
                : 'bg-[#121212] text-white/50 border-white/15 hover:border-white'
            }`}
            title={isMuted ? 'Voice Muted (Click to enable)' : 'Voice Active'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* Camera Mode Toggle */}
          <button
            id="ar-camera-toggle"
            onClick={() => setUseRealCamera(!useRealCamera)}
            className={`px-3 py-1.5 border text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              useRealCamera
                ? 'bg-[#ff3e00] text-white border-white'
                : 'bg-black text-white border-white/20 hover:border-white'
            }`}
          >
            {useRealCamera ? 'LIVE CAMERA' : 'SIMULATED HUD'}
          </button>
        </div>
      </header>

      {/* Arrival Confirmation Overlay */}
      {isArrived && (
        <div
          id="ar-arrival-overlay"
          className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="max-w-sm w-full bg-[#121212] border-2 border-[#ff3e00] p-6 text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-[#ff3e00] text-white flex items-center justify-center mx-auto mb-4 border border-white">
              <span className="material-symbols-outlined text-4xl">done_all</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#ff3e00] uppercase tracking-widest">
              NAVIGATION COMPLETED
            </span>
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mt-1">
              Arrived at Destination
            </h3>
            <p className="text-sm font-bold text-white uppercase mt-1">{destination.name}</p>
            <p className="text-xs font-mono text-white/50 uppercase mt-2">
              Level {destination.floor} • All {totalSteps} waypoints cleared
            </p>

            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <button
                id="ar-restart-route-btn"
                onClick={handleRestartRoute}
                className="py-2.5 bg-black border border-white/20 text-white font-bold text-xs uppercase hover:bg-white/10 transition-colors cursor-pointer"
              >
                Restart Route
              </button>
              <button
                id="ar-finish-exit-btn"
                onClick={onClose}
                className="py-2.5 bg-[#ff3e00] text-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                Exit to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR HUD Bottom Guidance Panel */}
      <div
        id="ar-guidance-panel"
        className="relative z-20 mt-auto p-4 sm:p-6 bg-gradient-to-t from-black via-black/95 to-transparent"
      >
        <div className="max-w-lg mx-auto bg-[#121212] border border-white/20 p-4 sm:p-5 shadow-2xl">
          {/* Step Progress Indicators Bar */}
          <div className="flex items-center gap-1.5 mb-3">
            {steps.map((step, idx) => (
              <button
                key={step.id || idx}
                id={`ar-step-indicator-${idx + 1}`}
                onClick={() => handleSelectStep(idx)}
                className={`flex-1 h-1.5 transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-[#ff3e00]'
                    : idx < currentStepIndex
                    ? 'bg-white'
                    : 'bg-white/15 hover:bg-white/30'
                }`}
                title={`Jump to Step ${idx + 1}: ${step.instruction}`}
              />
            ))}
          </div>

          {/* Step Meta Info */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ff3e00] text-[18px]">
                {currentStepData?.icon || 'straight'}
              </span>
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                INSTRUCTION // STEP {currentStepIndex + 1} OF {totalSteps}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black text-[#ff3e00]">
                {currentStepData?.distanceMeters || 25}M
              </span>
              <button
                id="ar-replay-voice-btn"
                onClick={() => speakInstruction(currentStepData?.instruction)}
                className="text-white/60 hover:text-white flex items-center gap-0.5 text-[10px] font-mono uppercase cursor-pointer"
                title="Replay Voice Instruction"
              >
                <span className="material-symbols-outlined text-[14px]">replay</span>
                <span className="hidden sm:inline">Voice</span>
              </button>
            </div>
          </div>

          {/* Step Main Instruction */}
          <div className="text-sm sm:text-base font-display font-black text-white uppercase tracking-tight mb-1">
            {currentStepData?.instruction}
          </div>

          {/* AR Hint */}
          <div className="text-xs font-mono text-white/50 uppercase mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ff3e00] text-[14px]">
              view_in_ar
            </span>
            <span>
              {currentStepData?.arHint || 'Follow holographic beacon guidance on the station floor.'}
            </span>
          </div>

          {/* Navigation Action Buttons Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Previous Step Button */}
            <button
              id="ar-prev-step-button"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                currentStepIndex === 0
                  ? 'bg-black text-white/30 border-white/10 cursor-not-allowed'
                  : 'bg-black hover:bg-white/10 text-white border-white/20 active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Next Step / Arrive Button */}
            <button
              id="ar-next-step-button"
              onClick={handleNextStep}
              className={`col-span-2 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                currentStepIndex === totalSteps - 1
                  ? 'bg-[#ff3e00] text-white hover:bg-white hover:text-black border border-[#ff3e00]'
                  : 'bg-white text-black hover:bg-[#ff3e00] hover:text-white border border-white'
              }`}
            >
              {currentStepIndex === totalSteps - 1 ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Confirm Arrival ✓</span>
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
