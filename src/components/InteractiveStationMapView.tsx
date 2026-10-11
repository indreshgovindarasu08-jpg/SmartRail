import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Station,
  StationPOI,
  UserPreferences,
  ActiveRoute,
  RouteStrategy,
  NavigationState,
  NavigationStep,
  CrowdLevel,
} from '../types';
import { COIMBATORE_JUNCTION_GRAPH, COIMBATORE_QR_CHECKPOINTS } from '../data/coimbatoreNavigationGraph';
import { AStarRoutingEngine } from '../services/routing/astarEngine';
import { railwayEvents, railwayService } from '../services/railway/railwayDataService';
import { spatialAnchorService } from '../services/positioning/spatialAnchorService';
import { getStationBlueprint } from '../data/stationMapLayouts';

interface InteractiveStationMapViewProps {
  station: Station;
  userPrefs: UserPreferences;
  onUpdateUserPrefs: (prefs: Partial<UserPreferences>) => void;
  onLaunchAR: (route?: ActiveRoute | null, poi?: StationPOI | null) => void;
  onBack: () => void;
  initialDestinationId?: string;
  onOpenAICommand?: (prompt?: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const InteractiveStationMapView: React.FC<InteractiveStationMapViewProps> = ({
  station,
  userPrefs,
  onUpdateUserPrefs,
  onLaunchAR,
  onBack,
  initialDestinationId,
  onOpenAICommand,
  isDark = true,
  onToggleTheme,
}) => {
  // Map Viewport & Perspective State
  const [currentFloor, setCurrentFloor] = useState<'L2' | 'G' | 'L1'>('G');
  const [is3D, setIs3D] = useState(station.mappingMode === '3D_AR' || station.mappingMode === '3D' || station.has3D);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tiltAngle, setTiltAngle] = useState(38);
  const [rotationAngle, setRotationAngle] = useState(-10);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [showCrowdHeatmap, setShowCrowdHeatmap] = useState(false);

  // QR Anchor & Positioning State
  const [currentAnchor, setCurrentAnchor] = useState(() => spatialAnchorService.getCurrentAnchor());
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Destination & Route Selection
  const [activePOI, setActivePOI] = useState<StationPOI | null>(() => {
    if (initialDestinationId) {
      return station.pois.find((p) => p.id === initialDestinationId) || null;
    }
    return null;
  });

  const [selectedStrategy, setSelectedStrategy] = useState<RouteStrategy>(
    userPrefs.avoidStairs ? 'accessible' : 'fastest'
  );

  // Navigation State Engine
  const [navState, setNavState] = useState<NavigationState>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(!userPrefs.voiceGuidance);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [livePlatformAlert, setLivePlatformAlert] = useState<{
    originalPlatform: string;
    newPlatform: string;
    train: string;
    trainNumber?: string;
  } | null>(null);

  const prevStepRef = useRef<number>(-1);

  // A* Routing Engine Instance for this station
  const routingEngine = useMemo(() => {
    return new AStarRoutingEngine(COIMBATORE_JUNCTION_GRAPH);
  }, []);

  // Distinct Architectural Blueprint for currently selected station
  const blueprint = useMemo(() => {
    return getStationBlueprint(station);
  }, [station]);

  // Listen to live platform change events from Railway Event Bus
  useEffect(() => {
    const unsub = railwayEvents.on('PLATFORM_CHANGED', (data: any) => {
      setLivePlatformAlert({
        originalPlatform: data.originalPlatform,
        newPlatform: data.newPlatform,
        train: data.trainName || `Train #${data.trainNumber}`,
        trainNumber: data.trainNumber,
      });
      speakInstruction(`Attention: ${data.trainName || 'Train'} platform changed from ${data.originalPlatform} to ${data.newPlatform}`);
    });

    return () => unsub();
  }, []);

  // Sync initial destination if prop changes
  useEffect(() => {
    if (initialDestinationId) {
      const found = station.pois.find((p) => p.id === initialDestinationId);
      if (found) {
        setActivePOI(found);
        setCurrentFloor(found.floor);
        setNavState('preview');
      }
    }
  }, [initialDestinationId, station.pois]);

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

  // Filter POIs for current floor and search
  const visiblePOIs = useMemo(() => {
    return station.pois.filter((poi) => {
      if (poi.floor !== currentFloor) return false;
      if (selectedCategory && poi.category !== selectedCategory) return false;
      if (searchQuery) {
        return (
          poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          poi.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          poi.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });
  }, [station.pois, currentFloor, selectedCategory, searchQuery]);

  // Calculate A* Route Options for 3 distinct strategies
  const routeOptions = useMemo(() => {
    if (!activePOI) return null;

    const startNode = routingEngine.findClosestNode(currentAnchor.x, currentAnchor.y, currentAnchor.floor) ||
      COIMBATORE_JUNCTION_GRAPH.nodes[0];
    const targetNode = routingEngine.findNodeByPoiId(activePOI.id) ||
      routingEngine.findClosestNode(activePOI.x, activePOI.y, activePOI.floor) ||
      COIMBATORE_JUNCTION_GRAPH.nodes[COIMBATORE_JUNCTION_GRAPH.nodes.length - 1];

    const fastestRes = routingEngine.findRoute(startNode.id, targetNode.id, 'FASTEST');
    const accessibleRes = routingEngine.findRoute(startNode.id, targetNode.id, 'ACCESSIBLE') || fastestRes;
    const lowCrowdRes = routingEngine.findRoute(startNode.id, targetNode.id, 'LOW_CROWD') || fastestRes;

    return {
      fastest: {
        strategy: 'fastest' as RouteStrategy,
        distanceMeters: fastestRes?.distanceMeters || 60,
        durationMinutes: fastestRes?.durationMinutes || 1,
        avoidStairs: false,
        crowdLabel: 'Moderate' as const,
        description: 'Direct concourse path via central stairways & escalators.',
        raw: fastestRes,
      },
      accessible: {
        strategy: 'accessible' as RouteStrategy,
        distanceMeters: accessibleRes?.distanceMeters || 75,
        durationMinutes: accessibleRes?.durationMinutes || 2,
        avoidStairs: true,
        crowdLabel: 'Low' as const,
        description: '100% Step-free route via Glass Elevator Bank A and L2 Skywalk.',
        raw: accessibleRes,
      },
      low_crowd: {
        strategy: 'low_crowd' as RouteStrategy,
        distanceMeters: lowCrowdRes?.distanceMeters || 85,
        durationMinutes: lowCrowdRes?.durationMinutes || 2,
        avoidStairs: false,
        crowdLabel: 'Low' as const,
        description: 'Subway L1 perimeter bypass avoiding main ticketing rush.',
        raw: lowCrowdRes,
      },
    };
  }, [activePOI, currentAnchor, routingEngine]);

  // Build the active route object based on selected strategy
  const activeRoute: ActiveRoute | null = useMemo(() => {
    if (!activePOI || !routeOptions) return null;

    const opt = routeOptions[selectedStrategy];
    const rawResult = opt.raw;

    if (rawResult && rawResult.success) {
      return {
        destination: activePOI,
        strategy: selectedStrategy,
        distanceMeters: rawResult.distanceMeters,
        durationMinutes: rawResult.durationMinutes,
        avoidStairs: selectedStrategy === 'accessible' || userPrefs.avoidStairs,
        crowdLabel: opt.crowdLabel,
        steps: rawResult.steps,
        pathPoints: rawResult.pathPoints,
        stairsCount: rawResult.stairsCount,
        liftsCount: rawResult.liftsCount,
      };
    }

    // Default fallback path
    return {
      destination: activePOI,
      strategy: selectedStrategy,
      distanceMeters: opt.distanceMeters,
      durationMinutes: opt.durationMinutes,
      avoidStairs: selectedStrategy === 'accessible' || userPrefs.avoidStairs,
      crowdLabel: opt.crowdLabel,
      steps: [
        {
          id: 's1',
          instruction: `Proceed from ${currentAnchor.anchorName} towards ${activePOI.name}`,
          distanceMeters: opt.distanceMeters,
          icon: 'straight',
          floor: currentAnchor.floor,
          actionType: 'straight',
        },
      ],
      pathPoints: [
        { x: currentAnchor.x, y: currentAnchor.y, floor: currentAnchor.floor },
        { x: activePOI.x, y: activePOI.y, floor: activePOI.floor },
      ],
    };
  }, [activePOI, routeOptions, selectedStrategy, userPrefs.avoidStairs, currentAnchor]);

  // Voice speech triggers on navigation step change
  useEffect(() => {
    if (navState === 'started' && activeRoute && currentStepIndex < activeRoute.steps.length) {
      if (prevStepRef.current !== currentStepIndex) {
        prevStepRef.current = currentStepIndex;
        const step = activeRoute.steps[currentStepIndex];
        speakInstruction(step.instruction);
      }
    }
  }, [navState, currentStepIndex, activeRoute]);

  // Handle POI selection
  const handleSelectPOI = (poi: StationPOI) => {
    setActivePOI(poi);
    setCurrentFloor(poi.floor);
    setNavState('preview');
    setCurrentStepIndex(0);
    setLivePlatformAlert(null);
  };

  const handleResetRoute = () => {
    setActivePOI(null);
    setNavState('idle');
    setCurrentStepIndex(0);
    setLivePlatformAlert(null);
  };

  const handleStartNavigation = () => {
    setNavState('started');
    setCurrentStepIndex(0);
    if (activeRoute) {
      speakInstruction(`Navigation started. ${activeRoute.steps[0]?.instruction}`);
    }
  };

  const handleNextStep = () => {
    if (!activeRoute) return;
    if (currentStepIndex < activeRoute.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = activeRoute.steps[nextIdx];
      setCurrentFloor(nextStep.floor);
      speakInstruction(nextStep.instruction);
    } else {
      setNavState('arrived');
      speakInstruction(`You have arrived at ${activeRoute.destination.name}`);
    }
  };

  const handleSimulateOffRoute = () => {
    setIsOffRoute(true);
    setNavState('recalculating');
    speakInstruction('Off route detected. Recalculating path to destination...');
    setTimeout(() => {
      setIsOffRoute(false);
      setNavState('started');
      speakInstruction('Route updated. Continue straight 20 meters.');
    }, 1800);
  };

  const handleTriggerPlatformChange = () => {
    railwayService.simulatePlatformChange('12676', 'Platform 4');
  };

  const handleApplyPlatformChange = () => {
    const p4 = station.pois.find((p) => p.id === 'cbe-plat-4') || station.pois[0];
    setActivePOI({
      ...p4,
      id: 'cbe-plat-4',
      name: 'Platform 4 (West Coast Bay)',
      description: 'Platform Telemetry Updated: Kovai SF Express moved to Platform 4',
    });
    setLivePlatformAlert(null);
    setCurrentStepIndex(0);
    setNavState('started');
    speakInstruction('Route re-calculated to Platform 4.');
  };

  const handleRecalibrateQR = (code: string) => {
    const calibrated = spatialAnchorService.calibrateWithQR(code);
    if (calibrated) {
      setCurrentAnchor(calibrated);
      setCurrentFloor(calibrated.floor);
      setShowQRScannerModal(false);
      speakInstruction(`Position anchored at ${calibrated.anchorName}`);
    }
  };

  const handleRecenter = () => {
    setZoomLevel(1);
    setTiltAngle(38);
    setRotationAngle(-10);
    setMapOffset({ x: 0, y: 0 });
    setCurrentFloor('G');
  };

  return (
    <div className="w-full h-screen bg-[#070707] text-white overflow-hidden flex flex-col relative select-none font-sans">
      {/* Top Telemetry & Spatial Header */}
      <header className="fixed top-0 w-full z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-4 md:px-6 h-16 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/10 transition-colors text-white active:scale-95 flex items-center justify-center cursor-pointer border border-transparent hover:border-white/20"
            aria-label="Back to stations"
          >
            <span className="material-symbols-outlined text-[#ff3e00]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-wider truncate max-w-[180px] sm:max-w-[320px]">
                {station.name} ({station.code || 'CBE'})
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#ff3e00]/20 text-[#ff3e00] border border-[#ff3e00]/40 uppercase font-bold hidden sm:inline">
                {station.mappingMode === '3D_AR' ? '3D + AR TWIN' : station.mappingMode}
              </span>
            </div>
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest truncate">
              ANCHOR: {currentAnchor.anchorName} • LEVEL {currentFloor}
            </span>
          </div>
        </div>

        {/* Floor Slicing Controls & Modes */}
        <div className="flex items-center gap-2">
          {/* Floor Level Tabs */}
          <div className="flex bg-[#121212] border border-white/15">
            {(['L2', 'G', 'L1'] as const).map((floor) => (
              <button
                key={floor}
                onClick={() => setCurrentFloor(floor)}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  currentFloor === floor
                    ? 'bg-[#ff3e00] text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>

          {/* QR Anchor Calibration Button */}
          <button
            onClick={() => setShowQRScannerModal(true)}
            className="p-2 bg-[#121212] border border-white/15 text-white/70 hover:text-white hover:border-[#ff3e00] transition-colors cursor-pointer flex items-center justify-center"
            title="Scan QR Checkpoint Anchor"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400">qr_code_scanner</span>
          </button>

          {/* Voice Mute / Unmute */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              onUpdateUserPrefs({ voiceGuidance: isMuted });
            }}
            className={`p-2 border transition-all cursor-pointer flex items-center justify-center ${
              !isMuted
                ? 'bg-white text-black border-white'
                : 'bg-[#121212] text-white/50 border-white/15 hover:border-white'
            }`}
            title={isMuted ? 'Voice Muted (Click to enable)' : 'Voice Guidance Active'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 bg-[#121212] border border-white/15 text-white/70 hover:text-white hover:border-[#ff3e00] transition-colors cursor-pointer flex items-center justify-center"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme mode"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-300">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}

          {/* AR View Switch */}
          <button
            onClick={() => onLaunchAR(activeRoute, activePOI)}
            className="px-3 py-1.5 bg-[#181818] border border-white/20 text-white text-xs font-black uppercase tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-1.5 cursor-pointer"
            title="Launch AR Camera Spatial Guidance"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ff3e00]">
              view_in_ar
            </span>
            <span className="hidden sm:inline">AR VIEW</span>
          </button>
        </div>
      </header>

      {/* Main 3D Spatial Canvas Stage */}
      <main className="flex-1 relative w-full h-full pt-16 pb-80 overflow-hidden bg-[#070707]">
        {/* Background Digital Twin Architectural Grid */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.25) 1px, transparent 0),
              linear-gradient(to right, rgba(255, 62, 0, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px, 96px 96px',
          }}
        />

        {/* 3D Multi-Floor Interactive Spatial Station Canvas */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing"
          style={{
            transform: is3D
              ? `perspective(1100px) rotateX(${tiltAngle}deg) rotateZ(${rotationAngle}deg) scale(${zoomLevel}) translate(${mapOffset.x}px, ${mapOffset.y}px)`
              : `scale(${zoomLevel}) translate(${mapOffset.x}px, ${mapOffset.y}px)`,
          }}
        >
          {/* Station Building 3D Slab */}
          <div className="relative w-[360px] sm:w-[500px] md:w-[640px] h-[360px] sm:h-[500px] md:h-[640px] bg-[#111111] border-2 border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.95)] p-4 overflow-hidden transition-all duration-300">
            {/* Level & Mode Indicator with Station Code */}
            <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/95 border border-white/20 text-[9px] font-mono font-bold text-white flex items-center gap-2 uppercase tracking-widest shadow-lg">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: blueprint.accentColor }} />
              <span>
                {station.code} // LEVEL {currentFloor} ({blueprint.stationType} - {blueprint.platformCount} PLATFORMS)
              </span>
            </div>

            {/* Architectural Blueprint Vector Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              fill="none"
            >
              {/* Outer Station Shell with Station Accent */}
              <rect
                x="6"
                y="6"
                width="88"
                height="88"
                stroke={blueprint.accentColor}
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />

              {/* Concourse Central Atrium */}
              <ellipse
                cx={blueprint.concourse.cx}
                cy={blueprint.concourse.cy}
                rx={blueprint.concourse.rx}
                ry={blueprint.concourse.ry}
                stroke={blueprint.accentColor}
                strokeWidth="0.8"
                strokeDasharray="2 2"
                fill={`${blueprint.accentColor}0a`}
              />
              <text
                x={blueprint.concourse.cx}
                y={blueprint.concourse.cy}
                fill="#ffffff"
                opacity="0.7"
                fontSize="1.6"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {blueprint.concourse.name}
              </text>

              {/* Station Specific Platforms */}
              {blueprint.platforms.map((p) => (
                <g key={p.id}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.width}
                    height={p.height}
                    fill="rgba(255,255,255,0.08)"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={p.x + p.width / 2}
                    y={p.y - 2}
                    fill="#ffffff"
                    opacity="0.8"
                    fontSize="1.7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    PF {p.number}
                  </text>
                  <text
                    x={p.x + p.width / 2}
                    y={p.y + p.height / 2}
                    fill={blueprint.accentColor}
                    opacity="0.8"
                    fontSize="1.4"
                    fontFamily="monospace"
                    textAnchor="middle"
                    transform={`rotate(90, ${p.x + p.width / 2}, ${p.y + p.height / 2})`}
                  >
                    {p.label}
                  </text>
                </g>
              ))}

              {/* Railway Tracks (Dashed lines between platforms) */}
              {blueprint.tracks.map((t, idx) => (
                <line
                  key={idx}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={blueprint.accentColor}
                  strokeWidth="0.8"
                  strokeOpacity="0.45"
                  strokeDasharray="2.5 1.5"
                />
              ))}

              {/* Station Specific Footbridges & Underpasses */}
              {blueprint.bridges.map((b, idx) => {
                const isActive = currentFloor === b.floor;
                return (
                  <g key={idx}>
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.width}
                      height={b.height}
                      fill={isActive ? `${b.color}35` : 'rgba(255,255,255,0.04)'}
                      stroke={b.color}
                      strokeWidth={isActive ? '1.2' : '0.6'}
                      strokeDasharray={isActive ? 'none' : '1.5 1'}
                    />
                    <text
                      x={b.x + b.width / 2}
                      y={b.y + b.height / 2 + 0.6}
                      fill={isActive ? '#ffffff' : b.color}
                      fontSize="1.6"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                      letterSpacing="0.05em"
                    >
                      {b.name}
                    </text>
                  </g>
                );
              })}

              {/* Station Specific Entrance & Exit Gates */}
              {blueprint.entrances.map((e, idx) => (
                <g key={idx}>
                  <rect
                    x={e.x}
                    y={e.y}
                    width={e.width}
                    height={e.height}
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="0.8"
                  />
                  <text
                    x={e.x + e.width / 2}
                    y={e.y + e.height / 2 + 0.5}
                    fill="#ffffff"
                    opacity="0.9"
                    fontSize="1.4"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                    letterSpacing="0.05em"
                  >
                    {e.name}
                  </text>
                </g>
              ))}

              {/* Crowd Heatmap Overlay (Toggleable) */}
              {showCrowdHeatmap && (
                <g opacity="0.5">
                  <circle cx={blueprint.concourse.cx} cy={blueprint.concourse.cy} r="14" fill="#ff3e00" filter="blur(8px)" />
                  <circle cx="50" cy="40" r="10" fill="#ff3e00" filter="blur(6px)" />
                  <circle cx="70" cy="40" r="8" fill="#eab308" filter="blur(5px)" />
                </g>
              )}

              {/* Active Route Laser Path Rendering */}
              {activeRoute && activeRoute.pathPoints && activeRoute.pathPoints.length > 1 && (
                <g>
                  {/* Glowing Laser Base */}
                  <path
                    d={activeRoute.pathPoints
                      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                      .join(' ')}
                    fill="none"
                    stroke="#ff3e00"
                    strokeWidth="3"
                    strokeOpacity="0.4"
                    strokeLinecap="square"
                  />
                  {/* Animated Path Flow Core */}
                  <path
                    d={activeRoute.pathPoints
                      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                      .join(' ')}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    strokeLinecap="square"
                    className="animate-path-flow"
                  />
                </g>
              )}
            </svg>

            {/* Current Spatial Anchor / User Position Indicator */}
            {currentFloor === currentAnchor.floor && (
              <div
                className="absolute z-30 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                style={{ left: `${currentAnchor.x}%`, top: `${currentAnchor.y}%` }}
              >
                <div className="w-8 h-8 bg-[#ff3e00]/25 flex items-center justify-center animate-pulse">
                  <div className="w-3.5 h-3.5 bg-[#ff3e00] border-2 border-white shadow-[0_0_15px_#ff3e00]" />
                </div>
                <span className="text-[8px] font-mono font-black text-white bg-black px-1.5 py-0.5 border border-white/40 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                  YOU ARE HERE
                </span>
              </div>
            )}

            {/* Interactive POI Markers on Floor */}
            {visiblePOIs.map((poi) => {
              const isTarget = activePOI?.id === poi.id;

              return (
                <button
                  key={poi.id}
                  onClick={() => handleSelectPOI(poi)}
                  className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-200 ${
                    isTarget ? 'scale-125 z-40' : 'hover:scale-115'
                  }`}
                  style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                  aria-label={poi.name}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center transition-all border ${
                      isTarget
                        ? 'bg-[#ff3e00] text-white border-white shadow-[0_0_20px_#ff3e00]'
                        : 'bg-[#181818] text-white/90 border-white/20 hover:border-[#ff3e00]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {poi.icon}
                    </span>
                  </div>

                  {/* Contextual Pin Label */}
                  <span
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider whitespace-nowrap border shadow-xl transition-opacity ${
                      isTarget
                        ? 'bg-white text-black border-white opacity-100 font-black'
                        : 'bg-black text-white border-white/20 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {poi.name} • {poi.walkingTimeMin}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Spatial Map Control Suite */}
        <div className="absolute right-4 bottom-80 z-30 flex flex-col gap-2 pointer-events-auto">
          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.2))}
            className="w-10 h-10 bg-[#121212] border border-white/20 text-white shadow-lg flex items-center justify-center hover:border-[#ff3e00] active:scale-95 cursor-pointer"
            aria-label="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.75))}
            className="w-10 h-10 bg-[#121212] border border-white/20 text-white shadow-lg flex items-center justify-center hover:border-[#ff3e00] active:scale-95 cursor-pointer"
            aria-label="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>

          <div className="h-px w-6 bg-white/15 my-0.5 mx-auto" />

          {/* Recenter & Reset Orbit */}
          <button
            onClick={handleRecenter}
            className="w-10 h-10 bg-[#121212] border border-white/20 text-white shadow-lg flex items-center justify-center hover:border-[#ff3e00] active:scale-95 cursor-pointer"
            title="Recenter Camera Orbit"
          >
            <span className="material-symbols-outlined text-[18px]">my_location</span>
          </button>

          {/* 3D vs 2D Perspective Mode */}
          <button
            onClick={() => setIs3D(!is3D)}
            className={`w-10 h-10 border shadow-lg flex items-center justify-center text-[10px] font-mono font-black transition-all active:scale-95 cursor-pointer ${
              is3D
                ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                : 'bg-[#121212] text-white/60 border-white/20 hover:text-white'
            }`}
            title="Toggle 3D Perspective vs 2D Plan"
          >
            {is3D ? '3D' : '2D'}
          </button>

          {/* Crowd Heatmap Toggle */}
          <button
            onClick={() => setShowCrowdHeatmap(!showCrowdHeatmap)}
            className={`w-10 h-10 border shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              showCrowdHeatmap
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-[#121212] text-white/60 border-white/20 hover:text-white'
            }`}
            title="Toggle Crowd Telemetry Heatmap"
          >
            <span className="material-symbols-outlined text-[18px]">density_medium</span>
          </button>
        </div>
      </main>

      {/* Live Platform Changed Alert Banner */}
      {livePlatformAlert && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-lg mx-auto bg-[#181818] border-2 border-amber-500 p-4 shadow-2xl animate-bounce">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-400 text-2xl">
                warning
              </span>
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  PLATFORM TELEMETRY UPDATE
                </div>
                <div className="text-xs font-display font-black text-white uppercase">
                  {livePlatformAlert.train} changed: {livePlatformAlert.originalPlatform} → {livePlatformAlert.newPlatform}
                </div>
              </div>
            </div>
            <button
              onClick={handleApplyPlatformChange}
              className="px-3 py-1.5 bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-white cursor-pointer"
            >
              Update Route
            </button>
          </div>
        </div>
      )}

      {/* Turn-by-Turn Guidance HUD (Navigation Started Mode) */}
      {navState === 'started' && activeRoute && (
        <div className="fixed top-20 left-4 right-4 z-40 max-w-lg mx-auto bg-[#0f0f0f] border-2 border-[#ff3e00] p-4 shadow-[0_15px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 bg-[#ff3e00] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">
                {activeRoute.steps[currentStepIndex]?.icon || 'navigation'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#ff3e00] uppercase tracking-widest">
                  NEXT ACTION • STEP {currentStepIndex + 1}/{activeRoute.steps.length}
                </span>
                <span className="text-[11px] font-mono font-black text-white">
                  {activeRoute.steps[currentStepIndex]?.distanceMeters}M
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-display font-black text-white uppercase leading-tight mt-0.5">
                {activeRoute.steps[currentStepIndex]?.instruction}
              </h2>
              {activeRoute.steps[currentStepIndex]?.arHint && (
                <div className="text-[11px] text-white/70 flex items-center gap-1.5 mt-1 font-mono uppercase">
                  <span className="material-symbols-outlined text-[14px] text-[#ff3e00]">
                    view_in_ar
                  </span>
                  <span>{activeRoute.steps[currentStepIndex]?.arHint}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleResetRoute}
              className="p-1 text-white/40 hover:text-white cursor-pointer"
              title="Cancel Navigation"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs font-mono text-white/60 uppercase">
              <span>
                ETA: <strong className="text-white">{activeRoute.durationMinutes} MIN</strong>
              </span>
              <span>•</span>
              <button
                onClick={() =>
                  speakInstruction(activeRoute.steps[currentStepIndex]?.instruction)
                }
                className="text-white hover:text-[#ff3e00] flex items-center gap-1 cursor-pointer font-bold"
                title="Replay Voice Prompt"
              >
                <span className="material-symbols-outlined text-[14px]">replay</span>
                <span>Voice</span>
              </button>
              <span>•</span>
              <button
                onClick={handleSimulateOffRoute}
                className="text-white/40 hover:text-amber-400 cursor-pointer text-[10px]"
                title="Test Off-Route Recovery Algorithm"
              >
                Simulate Drift
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleNextStep}
                className="px-5 py-2 bg-white text-black font-display font-black uppercase text-xs hover:bg-[#ff3e00] hover:text-white transition-colors cursor-pointer"
              >
                {currentStepIndex < activeRoute.steps.length - 1 ? 'Next Step →' : 'Arrived'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Calibration Modal */}
      {showQRScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121212] border-2 border-white/20 p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-xl">qr_code_scanner</span>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                  SPATIAL CHECKPOINT ANCHOR
                </h3>
              </div>
              <button
                onClick={() => setShowQRScannerModal(false)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-xs font-mono text-white/60 uppercase mb-4 leading-relaxed">
              Select or scan an authentic Coimbatore Junction physical QR checkpoint pillar to calibrate indoor positioning:
            </p>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {COIMBATORE_QR_CHECKPOINTS.map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => handleRecalibrateQR(cp.code)}
                  className="flex items-center justify-between p-3 bg-black border border-white/10 hover:border-[#ff3e00] text-left transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#ff3e00] uppercase">
                      {cp.name}
                    </div>
                    <div className="text-[10px] font-mono text-white/50 uppercase">
                      Code: {cp.code} • Floor Level {cp.floor}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">CALIBRATE →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Arrival Confirmation Modal */}
      {navState === 'arrived' && activeRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121212] border-2 border-white/20 p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 bg-white text-black flex items-center justify-center mx-auto mb-4 border border-white">
              <span className="material-symbols-outlined text-3xl">done_all</span>
            </div>
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
              Arrived at Destination
            </h3>
            <p className="text-sm font-bold text-[#ff3e00] uppercase mt-1">
              {activeRoute.destination.name}
            </p>
            <p className="text-xs font-mono text-white/50 uppercase mt-2">
              Level {activeRoute.destination.floor} • Completed in {activeRoute.durationMinutes} min
            </p>
            <button
              onClick={handleResetRoute}
              className="mt-6 w-full py-3 bg-[#ff3e00] text-white font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              Finish Guidance
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet Contextual Panel */}
      <div className="fixed bottom-0 left-0 w-full z-30 bg-[#121212] border-t border-white/15 px-4 py-4 shadow-[0_-12px_40px_rgba(0,0,0,0.95)] max-h-[380px] overflow-y-auto">
        {!activeRoute ? (
          /* DISCOVERY & SEARCH PANEL */
          <div className="flex flex-col gap-3 max-w-xl mx-auto">
            {/* Search Input Field */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH PLATFORM, ELEVATOR, UTS TICKET, OR TRAIN..."
                className="w-full bg-black/90 border border-white/20 py-2.5 pl-10 pr-24 text-xs font-bold uppercase tracking-wider text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff3e00] transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {onOpenAICommand && (
                  <button
                    onClick={() => onOpenAICommand()}
                    className="px-2 py-1 bg-white/10 hover:bg-[#ff3e00] hover:text-white text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1"
                    title="SmartRail AI Navigation Assistant"
                  >
                    <span className="material-symbols-outlined text-[12px]">smart_toy</span>
                    <span>AI</span>
                  </button>
                )}
              </div>
            </div>

            {/* Semantic Facility Quick Filters */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'platform', label: 'Platforms', icon: 'train' },
                { id: 'elevator', label: 'Elevators', icon: 'elevator' },
                { id: 'restroom', label: 'Washrooms', icon: 'wc' },
                { id: 'food', label: 'Dining', icon: 'restaurant' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 p-2.5 border transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#ff3e00] border-[#ff3e00] text-white'
                      : 'bg-[#181818] border-white/10 text-white/80 hover:border-white/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Indexed POIs List */}
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between items-center px-1 text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">
                <span>
                  {selectedCategory
                    ? `FILTER: ${selectedCategory.toUpperCase()}`
                    : 'COIMBATORE JUNCTION AMENITIES'}
                </span>
                <button
                  onClick={handleTriggerPlatformChange}
                  className="text-white/30 hover:text-amber-400 cursor-pointer"
                  title="Simulate Realtime Railway Platform Change Telemetry"
                >
                  Simulate Live Platform Change
                </button>
              </div>

              {visiblePOIs.slice(0, 3).map((poi) => (
                <button
                  key={poi.id}
                  onClick={() => handleSelectPOI(poi)}
                  className="flex items-center gap-3 p-2.5 bg-[#181818] border border-white/10 hover:border-[#ff3e00] transition-colors w-full text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-white/50 group-hover:text-[#ff3e00] shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {poi.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-display font-black text-white group-hover:text-[#ff3e00] uppercase truncate">
                      {poi.name}
                    </div>
                    <div className="text-[10px] font-mono text-white/50 uppercase truncate">
                      Level {poi.floor} • {poi.description || 'Station Hall'}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#ff3e00] shrink-0">
                    {poi.walkingTimeMin} MIN →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ROUTE SELECTION & STRATEGY CARDS PANEL */
          <div className="flex flex-col gap-3 max-w-xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight">
                  {activeRoute.destination.name}
                </h2>
                <div className="flex items-center gap-2 text-white/60 text-xs font-mono uppercase mt-0.5">
                  <span className="material-symbols-outlined text-sm text-[#ff3e00]">
                    directions_walk
                  </span>
                  <span>{activeRoute.distanceMeters}M</span>
                  <span>•</span>
                  <span>{activeRoute.durationMinutes} MIN</span>
                  <span>•</span>
                  <span className="text-white font-bold">
                    LEVEL {activeRoute.destination.floor}
                  </span>
                </div>
              </div>

              <button
                onClick={handleResetRoute}
                className="w-7 h-7 bg-black border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[#ff3e00] cursor-pointer"
                aria-label="Close route preview"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* 3 Spatial Route Strategy Cards */}
            <div className="grid grid-cols-3 gap-2">
              {routeOptions &&
                (
                  [
                    {
                      id: 'fastest',
                      title: 'FASTEST',
                      data: routeOptions.fastest,
                      icon: 'bolt',
                    },
                    {
                      id: 'accessible',
                      title: 'STEP-FREE',
                      data: routeOptions.accessible,
                      icon: 'accessible',
                    },
                    {
                      id: 'low_crowd',
                      title: 'QUIET',
                      data: routeOptions.low_crowd,
                      icon: 'volume_down',
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedStrategy(opt.id)}
                    className={`p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedStrategy === opt.id
                        ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : 'bg-[#181818] text-white/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider">
                        {opt.title}
                      </span>
                      <span className="material-symbols-outlined text-[14px]">
                        {opt.icon}
                      </span>
                    </div>
                    <div className="my-1">
                      <div className="text-sm font-display font-black leading-none">
                        {opt.data.durationMinutes} MIN
                      </div>
                      <div className="text-[9px] font-mono opacity-60">
                        {opt.data.distanceMeters}m
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            {/* Action Buttons: Start 3D Guidance / AR Launch */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleStartNavigation}
                className="flex-1 py-3 bg-[#ff3e00] text-white font-display font-black text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                <span>START 3D GUIDANCE</span>
              </button>

              <button
                onClick={() => onLaunchAR(activeRoute, activePOI)}
                className="px-5 py-3 bg-white text-black font-display font-black text-xs uppercase tracking-wider hover:bg-[#ff3e00] hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
                <span>AR</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
