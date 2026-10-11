import React, { useState, useEffect } from 'react';
import { TabType, Station, UserPreferences, StationPOI, ActiveRoute, Coordinates, LocationStatus, NearbyStationsResponse, AppLanguage } from './types';
import { mockStations } from './data/stationsData';
import { locationService } from './services/location/locationService';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { SpatialIntroExperience } from './components/SpatialIntroExperience';
import { HomeScreen } from './components/HomeScreen';
import { WhereIsMyTrainView } from './components/WhereIsMyTrainView';
import { TrainDetailsView } from './components/TrainDetailsView';
import { MyJourneyDashboard } from './components/MyJourneyDashboard';
import { PlatformChangeAlertModal } from './components/PlatformChangeAlertModal';
import { StationDiscoveryView } from './components/StationDiscoveryView';
import { InteractiveStationMapView } from './components/InteractiveStationMapView';
import { AIAssistantView } from './components/AIAssistantView';
import { UserProfileView } from './components/UserProfileView';
import { ARNavigationView } from './components/ARNavigationView';
import { TicketsAndRoutesView } from './components/TicketsAndRoutesView';
import { LocationPermissionModal } from './components/LocationPermissionModal';
import { NearbyStationsView } from './components/NearbyStationsView';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [showSpatialIntro, setShowSpatialIntro] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('explore');
  const [stations, setStations] = useState<Station[]>(mockStations);
  const [currentStation, setCurrentStation] = useState<Station>(mockStations[0]); // Coimbatore Junction
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('12681');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('smartrail_theme');
      if (saved) return saved === 'dark';
    } catch (e) {
      // ignore
    }
    return true;
  });
  const [targetPOIId, setTargetPOIId] = useState<string | undefined>(undefined);
  const [showAROverlay, setShowAROverlay] = useState(false);
  const [activeRouteForAR, setActiveRouteForAR] = useState<ActiveRoute | null>(null);

  // Location Detection & Nearby Stations State
  const [showLocationPermissionModal, setShowLocationPermissionModal] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('IDLE');
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [nearbyData, setNearbyData] = useState<NearbyStationsResponse | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  // User Profile Preferences & Auth State
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(() => {
    let savedAuth: any = null;
    try {
      const raw = localStorage.getItem('smartrail_user_auth');
      if (raw) savedAuth = JSON.parse(raw);
    } catch (e) {}

    return {
      name: savedAuth?.name || 'Indresh Govindarasu',
      email: savedAuth?.email || 'indreshgovindarasu08@gmail.com',
      phoneNumber: savedAuth?.phoneNumber || '9876543210',
      avatar: savedAuth?.avatar || 'IG',
      isLoggedIn: savedAuth?.isLoggedIn ?? true,
      preferredRoute: 'Fastest',
      avoidStairs: savedAuth?.avoidStairs ?? true,
      accessibility: savedAuth?.accessibility || 'Wheelchair',
      appLanguage: 'English',
      voiceGuidance: true,
      hapticFeedback: true,
      highContrastMap: true,
    };
  });

  // Subscribe to location service status changes
  useEffect(() => {
    const unsubscribe = locationService.onStatusChange((status) => {
      setLocationStatus(status);
    });
    return () => {
      unsubscribe();
      locationService.stopWatchingLocation();
    };
  }, []);

  // Location request handler
  const handlePerformLocationDiscovery = async () => {
    setIsLoadingLocation(true);
    setLocationErrorMessage(null);

    try {
      const coords = await locationService.getCurrentLocation();
      setUserCoords(coords);

      const response = await locationService.fetchNearbyStations(coords.latitude, coords.longitude);
      setNearbyData(response);

      if (response.stations && response.stations.length > 0) {
        const nearestId = response.stations[0].id;
        const matchingStation = stations.find((s) => s.id === nearestId);
        if (matchingStation) {
          setCurrentStation(matchingStation);
        }
      }

      setShowLocationPermissionModal(false);
    } catch (err: any) {
      console.warn('Location detection notice:', err);
      if (err.code === 1) {
        setLocationErrorMessage('Location access was denied in browser settings. You can pick stations manually.');
      } else if (err.code === 3) {
        setLocationErrorMessage('Location request timed out. Please check GPS reception and retry.');
      } else {
        setLocationErrorMessage(err.message || 'Unable to detect device location.');
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // URL hash and query parameter router for direct link support (e.g. #login, #trains)
  useEffect(() => {
    const handleHashSync = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') || params.get('page');

      if (hash === '#login' || tabParam === 'login') {
        setShowSpatialIntro(false);
        setCurrentTab('login');
      } else if (hash === '#train_search' || hash === '#trains' || tabParam === 'train_search') {
        setShowSpatialIntro(false);
        setCurrentTab('train_search');
      } else if (hash === '#map' || tabParam === 'map') {
        setShowSpatialIntro(false);
        setCurrentTab('map');
      } else if (hash === '#profile' || tabParam === 'profile') {
        setShowSpatialIntro(false);
        setCurrentTab('profile');
      } else if (hash === '#home' || hash === '#explore') {
        setShowSpatialIntro(false);
        setCurrentTab('explore');
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'login') {
      window.location.hash = 'login';
    } else if (window.location.hash === '#login') {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {}
    }

    if (tab === 'nearby' && locationStatus === 'IDLE') {
      handlePerformLocationDiscovery();
    }
    setCurrentTab(tab);
  };

  const handleManualSelectLocation = () => {
    setShowLocationPermissionModal(false);
    handleTabChange('stations');
  };

  // Apply dark/light class to root element and persist setting
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('light');
      root.classList.add('dark');
      try {
        localStorage.setItem('smartrail_theme', 'dark');
      } catch (e) {}
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      try {
        localStorage.setItem('smartrail_theme', 'light');
      } catch (e) {}
    }
  }, [isDark]);

  const handleUpdateUserPrefs = (newPrefs: Partial<UserPreferences>) => {
    setUserPrefs((prev) => {
      const merged = { ...prev, ...newPrefs };
      try {
        localStorage.setItem('smartrail_user_auth', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleNavigateToMapWithPOI = (poiId: string) => {
    setTargetPOIId(poiId);
    setCurrentTab('map');
  };

  const handleSelectStationAndOpenMap = (station: Station) => {
    setCurrentStation(station);
    setTargetPOIId(undefined);
    setCurrentTab('map');
  };

  const handleEnterMapFromIntro = (poi?: StationPOI) => {
    setShowSpatialIntro(false);
    if (poi) {
      setTargetPOIId(poi.id);
    }
    if (locationStatus === 'IDLE') {
      setShowLocationPermissionModal(true);
    }
    setCurrentTab('explore');
  };

  // Flagship "Take Me To My Train" CTA bridge (Sections 9, 10, 24)
  const handleTakeMeToMyTrain = (trainNumber: string, platformNumber?: string) => {
    setSelectedTrainNumber(trainNumber);
    const platNum = platformNumber ? platformNumber.replace(/[^0-9]/g, '') : '5';
    const targetId = `cbe-plat-${platNum}`;
    setTargetPOIId(targetId);
    setCurrentTab('map');
  };

  const handleRecalculateRouteForPlatform = (newPlatform: string) => {
    const platNum = newPlatform.replace(/[^0-9]/g, '');
    const targetId = `cbe-plat-${platNum}`;
    setTargetPOIId(targetId);
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans antialiased relative selection:bg-[#ff3e00] selection:text-white">
      {/* Global Realtime Platform Change Alert (Section 11) */}
      <PlatformChangeAlertModal
        onRecalculateRoute={handleRecalculateRouteForPlatform}
        appLanguage={userPrefs.appLanguage}
      />

      {/* Contextual Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showLocationPermissionModal}
        isDetecting={isLoadingLocation}
        errorMessage={locationErrorMessage}
        onAllow={handlePerformLocationDiscovery}
        onManualSelect={handleManualSelectLocation}
        onClose={() => setShowLocationPermissionModal(false)}
      />

      {/* Spatial Entry Experience Intro */}
      {showSpatialIntro && (
        <SpatialIntroExperience
          station={currentStation}
          onEnterMapWithDestination={handleEnterMapFromIntro}
          onEnterMapDirectly={() => handleEnterMapFromIntro()}
          onOpenLogin={() => {
            setShowSpatialIntro(false);
            handleTabChange('login');
          }}
        />
      )}

      {/* Top Application Bar (shown when not on 3D map or intro) */}
      {currentTab !== 'map' && !showSpatialIntro && (
        <TopAppBar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenMenu={() => setIsDrawerOpen(true)}
          stationName={currentStation.name}
          currentUser={userPrefs}
          onOpenAuth={() => handleTabChange('login')}
        />
      )}

      {/* Navigation Drawer Menu */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        stations={stations}
        currentStation={currentStation}
        onSelectStation={(s) => {
          setCurrentStation(s);
          setTargetPOIId(undefined);
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* AR Fullscreen Overlay */}
      {showAROverlay && (
        <ARNavigationView
          station={currentStation}
          targetPOI={currentStation.pois.find((p) => p.id === targetPOIId)}
          activeRoute={activeRouteForAR}
          onClose={() => {
            setShowAROverlay(false);
            setActiveRouteForAR(null);
          }}
        />
      )}

      {/* 1. MASTER HOME SCREEN (Section 3) */}
      {currentTab === 'explore' && !showSpatialIntro && (
        <HomeScreen
          currentStation={currentStation}
          onOpenTrainSearch={() => setCurrentTab('train_search')}
          onOpenStationNavigation={(plat) => {
            if (plat) setTargetPOIId(`cbe-plat-${plat}`);
            setCurrentTab('map');
          }}
          onOpenNearbyStations={() => {
            if (locationStatus === 'IDLE') handlePerformLocationDiscovery();
            setCurrentTab('nearby');
          }}
          onOpenAI={() => setCurrentTab('assistant')}
          onSelectTrain={(num) => {
            setSelectedTrainNumber(num);
            setCurrentTab('train_details');
          }}
          onTakeMeToMyTrain={handleTakeMeToMyTrain}
          appLanguage={userPrefs.appLanguage}
          onLanguageChange={(lang) => handleUpdateUserPrefs({ appLanguage: lang })}
          currentUser={userPrefs}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* 2. WHERE IS MY TRAIN SEARCH SCREEN (Section 4) */}
      {currentTab === 'train_search' && !showSpatialIntro && (
        <WhereIsMyTrainView
          currentStation={currentStation}
          onSelectTrain={(num) => {
            setSelectedTrainNumber(num);
            setCurrentTab('train_details');
          }}
          onTakeMeToMyTrain={handleTakeMeToMyTrain}
          onBack={() => setCurrentTab('explore')}
          appLanguage={userPrefs.appLanguage}
        />
      )}

      {/* 3. TRAIN DETAILS SCREEN (Sections 5, 8, 9, 10, 11, 12, 13) */}
      {currentTab === 'train_details' && !showSpatialIntro && (
        <TrainDetailsView
          trainNumber={selectedTrainNumber}
          currentStation={currentStation}
          onTakeMeToMyTrain={handleTakeMeToMyTrain}
          onBack={() => setCurrentTab('train_search')}
          appLanguage={userPrefs.appLanguage}
        />
      )}

      {/* 4. MY JOURNEY ACTIVE COMMUTER FLIGHT DECK (Section 24) */}
      {currentTab === 'my_journey' && !showSpatialIntro && (
        <MyJourneyDashboard
          currentStation={currentStation}
          onTakeMeToMyTrain={handleTakeMeToMyTrain}
          onExploreOtherTrains={() => setCurrentTab('train_search')}
          appLanguage={userPrefs.appLanguage}
        />
      )}

      {/* 5. INTERACTIVE 3D DIGITAL TWIN STATION MAP */}
      {currentTab === 'map' && !showSpatialIntro && (
        <InteractiveStationMapView
          station={currentStation}
          userPrefs={userPrefs}
          onUpdateUserPrefs={handleUpdateUserPrefs}
          onLaunchAR={(route, poi) => {
            if (route) setActiveRouteForAR(route);
            if (poi) setTargetPOIId(poi.id);
            setShowAROverlay(true);
          }}
          onBack={() => setCurrentTab('explore')}
          initialDestinationId={targetPOIId}
          onOpenAICommand={() => setCurrentTab('assistant')}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* 6. NEARBY STATIONS DISCOVERY */}
      {currentTab === 'nearby' && !showSpatialIntro && (
        <NearbyStationsView
          locationStatus={locationStatus}
          userCoords={userCoords}
          nearbyData={nearbyData}
          isLoading={isLoadingLocation}
          selectedStation={currentStation}
          onSelectStation={(stationId) => {
            const found = stations.find((s) => s.id === stationId);
            if (found) {
              setCurrentStation(found);
            }
          }}
          onEnterStationMap={(stationId) => {
            const found = stations.find((s) => s.id === stationId);
            if (found) {
              setCurrentStation(found);
              setTargetPOIId(undefined);
              setCurrentTab('map');
            }
          }}
          onLaunchAR={(stationId) => {
            const found = stations.find((s) => s.id === stationId);
            if (found) {
              setCurrentStation(found);
              setShowAROverlay(true);
            }
          }}
          onRefreshLocation={handlePerformLocationDiscovery}
          onRequestPermissionModal={() => setShowLocationPermissionModal(true)}
        />
      )}

      {/* 7. ALL STATIONS BROWSER */}
      {currentTab === 'stations' && !showSpatialIntro && (
        <StationDiscoveryView
          stations={stations}
          currentStation={currentStation}
          onSelectStation={setCurrentStation}
          onNavigateToMap={handleSelectStationAndOpenMap}
          onTabChange={(tab) => {
            if (tab === 'nearby' && locationStatus === 'IDLE') {
              handlePerformLocationDiscovery();
            }
            setCurrentTab(tab);
          }}
        />
      )}

      {/* 8. AR NAVIGATION VIEW */}
      {currentTab === 'ar_nav' && !showSpatialIntro && (
        <ARNavigationView
          station={currentStation}
          targetPOI={currentStation.pois.find((p) => p.id === targetPOIId)}
          activeRoute={activeRouteForAR}
          onClose={() => setCurrentTab('map')}
        />
      )}

      {/* 9. AI COPILOT / ASSISTANT */}
      {currentTab === 'assistant' && !showSpatialIntro && (
        <AIAssistantView
          currentStation={currentStation}
          userPrefs={userPrefs}
          onNavigateToPOI={(poiId) => {
            handleNavigateToMapWithPOI(poiId);
          }}
          onViewRouteDetails={(poiId) => {
            handleNavigateToMapWithPOI(poiId);
          }}
          onSelectTrain={(num) => {
            setSelectedTrainNumber(num);
            setCurrentTab('train_details');
          }}
          onTakeMeToMyTrain={handleTakeMeToMyTrain}
        />
      )}

      {/* 10. USER SETTINGS & ACCESSIBILITY PROFILE */}
      {currentTab === 'profile' && !showSpatialIntro && (
        <UserProfileView
          userPrefs={userPrefs}
          onUpdateUserPrefs={handleUpdateUserPrefs}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenLoginPage={() => handleTabChange('login')}
        />
      )}

      {/* 11. TICKETS & TIMETABLES */}
      {currentTab === 'tickets' && !showSpatialIntro && (
        <TicketsAndRoutesView
          currentStation={currentStation}
          onNavigateToPlatform={(platformId) => {
            handleNavigateToMapWithPOI(platformId);
          }}
        />
      )}

      {/* 12. DEDICATED SEPARATE COMMUTER LOGIN & REGISTRATION PAGE */}
      {currentTab === 'login' && !showSpatialIntro && (
        <LoginPage
          currentUser={userPrefs}
          currentStation={currentStation}
          onLoginSuccess={(updatedUser) => {
            handleUpdateUserPrefs(updatedUser);
          }}
          onLogout={() => {
            handleUpdateUserPrefs({
              isLoggedIn: false,
              name: 'Guest Commuter',
              email: '',
              phoneNumber: '',
              avatar: 'GC',
            });
          }}
          onNavigate={(tab) => handleTabChange(tab)}
        />
      )}

      {/* Commuter Authentication / Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userPrefs}
        currentStation={currentStation}
        onLoginSuccess={(updatedUser) => {
          handleUpdateUserPrefs(updatedUser);
        }}
        onLogout={() => {
          handleUpdateUserPrefs({
            isLoggedIn: false,
            name: 'Guest Commuter',
            email: '',
            phoneNumber: '',
            avatar: 'GC',
          });
        }}
      />

      {/* Bottom Floating Navigation Bar */}
      {!showSpatialIntro && !showAROverlay && currentTab !== 'ar_nav' && currentTab !== 'login' && (
        <BottomNavBar
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}
