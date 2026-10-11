import { AppLanguage } from '../../types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  knowYourTrain: string;
  findMyTrain: string;
  nearbyStations: string;
  navigateInsideStation: string;
  searchPlaceholder: string;
  recentSearches: string;
  takeMeToMyTrain: string;
  startStationNavigation: string;
  whereIsMyTrain: string;
  trackLiveJourney: string;
  platformChangedTitle: string;
  platformChangedDesc: string;
  continueNavigation: string;
  arrivesIn: string;
  arrivingSoon: string;
  onTime: string;
  delayed: string;
  running: string;
  platform: string;
  floor: string;
  fastestRoute: string;
  accessibleRoute: string;
  lowCrowdRoute: string;
  distanceFromPlatform: string;
  takeElevator: string;
  takeStairs: string;
  turnLeft: string;
  turnRight: string;
  continueStraight: string;
  arrivedAtDestination: string;
  dataFreshnessLive: string;
  updatedSecondsAgo: string;
  avoidStairs: string;
  glassElevatorAvailable: string;
  stationHubs: string;
  switchStation: string;
  myJourney: string;
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  English: {
    appName: 'SmartRail Navigator',
    tagline: 'Know your train. Know your station. Know exactly where to walk.',
    knowYourTrain: 'Know your train. Know your station. Know exactly where to walk.',
    findMyTrain: 'Find My Train',
    nearbyStations: 'Nearby Stations',
    navigateInsideStation: 'Navigate Inside Station',
    searchPlaceholder: 'Search by Train No (e.g. 12681), Name, Origin or Destination...',
    recentSearches: 'Recent Trains',
    takeMeToMyTrain: 'Take Me To My Train',
    startStationNavigation: 'Start Station Navigation',
    whereIsMyTrain: 'Where Is My Train?',
    trackLiveJourney: 'Track Live Journey',
    platformChangedTitle: 'PLATFORM CHANGED',
    platformChangedDesc: 'Your train is now arriving at',
    continueNavigation: 'Continue Navigation',
    arrivesIn: 'ARRIVES IN',
    arrivingSoon: 'Arriving soon — proceed to platform',
    onTime: 'ON TIME',
    delayed: 'DELAYED',
    running: 'RUNNING',
    platform: 'Platform',
    floor: 'Floor Level',
    fastestRoute: 'Fastest Route',
    accessibleRoute: 'Step-Free Accessible',
    lowCrowdRoute: 'Low-Crowd Bypass',
    distanceFromPlatform: 'You are',
    takeElevator: 'Take Glass Elevator to Level',
    takeStairs: 'Take Stairs to Level',
    turnLeft: 'Turn Left',
    turnRight: 'Turn Right',
    continueStraight: 'Continue straight',
    arrivedAtDestination: 'You have reached your platform',
    dataFreshnessLive: 'LIVE TELEMETRY',
    updatedSecondsAgo: 'Updated',
    avoidStairs: 'Avoid Stairs (Wheelchair / Luggage Friendly)',
    glassElevatorAvailable: 'Glass Elevators Operational',
    stationHubs: 'Station Hubs',
    switchStation: 'Switch Hub',
    myJourney: 'My Active Journey',
  },

  Tamil: {
    appName: 'ஸ்மார்ட்ரெயில் நேவிகேட்டர்',
    tagline: 'உங்கள் ரயிலை அறிந்திடுங்கள். நிலையத்தை உணருங்கள். எங்கு செல்ல வேண்டும் என்பதை துல்லியமாக வழிகாட்டுங்கள்.',
    knowYourTrain: 'உங்கள் ரயிலை அறிந்திடுங்கள். நிலையத்தை உணருங்கள். எங்கு செல்ல வேண்டும் என்பதை துல்லியமாக வழிகாட்டுங்கள்.',
    findMyTrain: 'ரயிலைத் தேடுக',
    nearbyStations: 'அருகிலுள்ள நிலையங்கள்',
    navigateInsideStation: 'நிலையத்தின் உள்ளே வழிகாட்டுதல்',
    searchPlaceholder: 'ரயில் எண் (உதா: 12681), பெயர், ஊர் மூலம் தேடுங்கள்...',
    recentSearches: 'சமீபத்திய தேடல்கள்',
    takeMeToMyTrain: 'என் ரயிலுக்கு வழிகாட்டு',
    startStationNavigation: 'நிலைய வழிகாட்டுதலைத் தொடங்கு',
    whereIsMyTrain: 'என் ரயில் எங்கே உள்ளது?',
    trackLiveJourney: 'நேரலை பயணத்தைக் காண்க',
    platformChangedTitle: 'நடைமேடை மாறியுள்ளது',
    platformChangedDesc: 'உங்கள் ரயில் வரும் நடைமேடை மாற்றப்பட்டுள்ளது:',
    continueNavigation: 'வழிகாட்டுதலைத் தொடர்க',
    arrivesIn: 'வந்து சேரும் நேரம்',
    arrivingSoon: 'விரைவில் வருகிறது — நடைமேடைக்கு செல்லவும்',
    onTime: 'சரியான நேரம்',
    delayed: 'தாமதம்',
    running: 'இயக்கத்தில் உள்ளது',
    platform: 'நடைமேடை',
    floor: 'தளம்',
    fastestRoute: 'விரைவான வழி',
    accessibleRoute: 'படி இல்லா சக்கர நாற்காலி வழி',
    lowCrowdRoute: 'கூட்டம் குறைந்த வழி',
    distanceFromPlatform: 'நீங்கள் உள்ள தூரம்',
    takeElevator: 'மின்தூக்கி (லிஃப்ட்) மூலம் செல்லவும்',
    takeStairs: 'படிக்கட்டுகள் மூலம் செல்லவும்',
    turnLeft: 'இடதுபுறம் திரும்பவும்',
    turnRight: 'வலதுபுறம் திரும்பவும்',
    continueStraight: 'நேராக செல்லவும்',
    arrivedAtDestination: 'நீங்கள் உங்கள் நடைமேடையை அடைந்துவிட்டீர்கள்',
    dataFreshnessLive: 'நேரலை தகவல்',
    updatedSecondsAgo: 'புதுப்பிக்கப்பட்டது',
    avoidStairs: 'படிகளைத் தவிர்ப்பது (சக்கர நாற்காலி / சுமைகள்)',
    glassElevatorAvailable: 'கண்ணாடி மின்தூக்கி இயங்குகிறது',
    stationHubs: 'ரயில் நிலையங்கள்',
    switchStation: 'நிலையம் மாற்று',
    myJourney: 'எனது பயணம்',
  },

  Hindi: {
    appName: 'स्मार्टरेल नेविगेटर',
    tagline: 'अपनी ट्रेन जानें। अपना स्टेशन समझें। जानें बिल्कुल कहाँ चलना है।',
    knowYourTrain: 'अपनी ट्रेन जानें। अपना स्टेशन समझें। जानें बिल्कुल कहाँ चलना है।',
    findMyTrain: 'मेरी ट्रेन खोजें',
    nearbyStations: 'निकटतम रेलवे स्टेशन',
    navigateInsideStation: 'स्टेशन के अंदर नेविगेट करें',
    searchPlaceholder: 'ट्रेन नंबर (उदा. 12681), नाम या गंतव्य से खोजें...',
    recentSearches: 'हाल की ट्रेनें',
    takeMeToMyTrain: 'मुझे मेरी ट्रेन तक ले चलो',
    startStationNavigation: 'स्टेशन नेविगेशन शुरू करें',
    whereIsMyTrain: 'मेरी ट्रेन कहाँ है?',
    trackLiveJourney: 'लाइव यात्रा ट्रैक करें',
    platformChangedTitle: 'प्लेटफ़ॉर्म बदल गया है',
    platformChangedDesc: 'आपकी ट्रेन अब इस प्लेटफ़ॉर्म पर आ रही है:',
    continueNavigation: 'नेविगेशन जारी रखें',
    arrivesIn: 'आगमन में शेष समय',
    arrivingSoon: 'शीघ्र आगमन — कृपया प्लेटफ़ॉर्म पर पहुँचें',
    onTime: 'समय पर',
    delayed: 'विलंबित',
    running: 'चल रही है',
    platform: 'प्लेटफ़ॉर्म',
    floor: 'तल',
    fastestRoute: 'सबसे तेज़ मार्ग',
    accessibleRoute: 'सुगम्य व्हीलचेयर मार्ग',
    lowCrowdRoute: 'कम भीड़ वाला मार्ग',
    distanceFromPlatform: 'आप प्लेटफ़ॉर्म से दूर हैं',
    takeElevator: 'लिफ्ट का उपयोग करें',
    takeStairs: 'सीढ़ियों का उपयोग करें',
    turnLeft: 'बाएँ मुड़ें',
    turnRight: 'दाएँ मुड़ें',
    continueStraight: 'सीधे आगे बढ़ें',
    arrivedAtDestination: 'आप अपने प्लेटफ़ॉर्म पर पहुँच गए हैं',
    dataFreshnessLive: 'लाइव टेलीमेट्री',
    updatedSecondsAgo: 'अपडेट किया गया',
    avoidStairs: 'सीढ़ियों से बचें (सुलभ मार्ग)',
    glassElevatorAvailable: 'ग्लास लिफ्ट चालू है',
    stationHubs: 'स्टेशन हब',
    switchStation: 'स्टेशन बदलें',
    myJourney: 'मेरी सक्रिय यात्रा',
  },

  Malayalam: {
    appName: 'സ്മാർട്ട്റെയിൽ നാവിഗേറ്റർ',
    tagline: 'നിങ്ങളുടെ ട്രെയിൻ അറിയുക. സ്റ്റേഷൻ മനസ്സിലാക്കുക. കൃത്യമായി നടക്കേണ്ട വഴി അറിയുക.',
    knowYourTrain: 'നിങ്ങളുടെ ട്രെയിൻ അറിയുക. സ്റ്റേഷൻ മനസ്സിലാക്കുക. കൃത്യമായി നടക്കേണ്ട വഴി അറിയുക.',
    findMyTrain: 'ട്രെയിൻ കണ്ടെത്തുക',
    nearbyStations: 'അടുത്തുള്ള സ്റ്റേഷനുകൾ',
    navigateInsideStation: 'സ്റ്റേഷനകത്ത് വഴികാട്ടി',
    searchPlaceholder: 'ട്രെയിൻ നമ്പർ (ഉദാ: 12681), പേര് എന്നിവ നൽകുക...',
    recentSearches: 'സമീപകാല ട്രെയിനുകൾ',
    takeMeToMyTrain: 'എന്നെ ട്രെയിനിലേക്ക് നയിക്കൂ',
    startStationNavigation: 'സ്റ്റേഷൻ നാവിഗേഷൻ ആരംഭിക്കുക',
    whereIsMyTrain: 'എന്റെ ട്രെയിൻ എവിടെ?',
    trackLiveJourney: 'തത്സമയ യാത്ര നിരീക്ഷിക്കുക',
    platformChangedTitle: 'പ്ലാറ്റ്ഫോം മാറിയിരിക്കുന്നു',
    platformChangedDesc: 'നിങ്ങളുടെ ട്രെയിൻ ഇപ്പോൾ എത്തിച്ചേരുന്നത്:',
    continueNavigation: 'തുടരുക',
    arrivesIn: 'എത്തിച്ചേരാൻ ബാക്കി',
    arrivingSoon: 'ഉടൻ എത്തിച്ചേരും — പ്ലാറ്റ്ഫോമിലേക്ക് നീങ്ങുക',
    onTime: 'കൃത്യസമയത്ത്',
    delayed: 'വൈകുന്നു',
    running: 'ഓടുന്നു',
    platform: 'പ്ലാറ്റ്ഫോം',
    floor: 'നില',
    fastestRoute: 'ഏറ്റവും വേഗമേറിയ വഴി',
    accessibleRoute: 'പടികളില്ലാത്ത വീൽചെയർ സൗഹൃദ വഴി',
    lowCrowdRoute: 'തിരക്ക് കുറഞ്ഞ വഴി',
    distanceFromPlatform: 'നിങ്ങൾ പ്ലാറ്റ്‌ഫോമിൽ നിന്ന്',
    takeElevator: 'ലിഫ്റ്റ് ഉപയോഗിക്കുക',
    takeStairs: 'പടികൾ കയറുക',
    turnLeft: 'ഇടത്തോട്ട് തിരിയുക',
    turnRight: 'വലത്തോട്ട് തിരിയുക',
    continueStraight: 'നേരെ മുന്നോട്ട് പോകുക',
    arrivedAtDestination: 'നിങ്ങൾ പ്ലാറ്റ്‌ഫോമിൽ എത്തിച്ചേർന്നു',
    dataFreshnessLive: 'തത്സമയ വിവരം',
    updatedSecondsAgo: 'പുതുക്കിയത്',
    avoidStairs: 'പടികൾ ഒഴിവാക്കുക',
    glassElevatorAvailable: 'ലിഫ്റ്റുകൾ പ്രവർത്തനക്ഷമം',
    stationHubs: 'സ്റ്റേഷൻ ഹബ്ബുകൾ',
    switchStation: 'സ്റ്റേഷൻ മാറ്റുക',
    myJourney: 'എന്റെ യാത്ര',
  },

  Telugu: {
    appName: 'స్మార్ట్‌రైల్ నేవిగేటర్',
    tagline: 'మీ రైలును తెలుసుకోండి. స్టేషన్‌ను గుర్తించండి. ఎక్కడ నడవాలో ఖచ్చితంగా తెలుసుకోండి.',
    knowYourTrain: 'మీ రైలును తెలుసుకోండి. స్టేషన్‌ను గుర్తించండి. ఎక్కడ నడవాలో ఖచ్చితంగా తెలుసుకోండి.',
    findMyTrain: 'నా రైలును వెతకండి',
    nearbyStations: 'సమీప రైల్వే స్టేషన్లు',
    navigateInsideStation: 'స్టేషన్ లోపల నావిగేషన్',
    searchPlaceholder: 'రైలు నంబర్ (ఉదా. 12681), పేరు లేదా గమ్యస్థానాన్ని శోధించండి...',
    recentSearches: 'ఇటీవలి రైళ్లు',
    takeMeToMyTrain: 'నన్ను నా రైలు వద్దకు తీసుకెళ్లండి',
    startStationNavigation: 'స్టేషన్ నావిగేషన్ ప్రారంభించండి',
    whereIsMyTrain: 'నా రైలు ఎక్కడ ఉంది?',
    trackLiveJourney: 'లైవ్ ప్రయాణాన్ని ట్రాక్ చేయండి',
    platformChangedTitle: 'ప్లాట్‌ఫాం మారింది',
    platformChangedDesc: 'మీ రైలు ఇప్పుడు రానున్న ప్లాట్‌ఫాం:',
    continueNavigation: 'నావిగేషన్ కొనసాగించండి',
    arrivesIn: 'చేరుకోవడానికి సమయం',
    arrivingSoon: 'త్వరలో రానుంది — ప్లాట్‌ఫాం వద్దకు వెళ్లండి',
    onTime: 'సమయానికి',
    delayed: 'ఆలస్యం',
    running: 'నడుస్తోంది',
    platform: 'ప్లాట్‌ఫాం',
    floor: 'అంతస్తు',
    fastestRoute: 'వేగవంతమైన మార్గం',
    accessibleRoute: 'మెట్లు లేని వీల్‌చైర్ మార్గం',
    lowCrowdRoute: 'రద్దీ తక్కువ మార్గం',
    distanceFromPlatform: 'మీరు ప్లాట్‌ఫాంకు ఉన్న దూరం',
    takeElevator: 'లిఫ్ట్ ఉపయోగించండి',
    takeStairs: 'మెట్లు ఎక్కండి',
    turnLeft: 'ఎడమవైపు తిరగండి',
    turnRight: 'కుడివైపు తిరగండి',
    continueStraight: 'నేరుగా వెళ్ళండి',
    arrivedAtDestination: 'మీరు మీ ప్లాట్‌ఫాం చేరుకున్నారు',
    dataFreshnessLive: 'లైవ్ టెలిమెట్రీ',
    updatedSecondsAgo: 'నవీకరించబడింది',
    avoidStairs: 'మెట్లను నివారించండి',
    glassElevatorAvailable: 'లిఫ్టులు అందుబాటులో ఉన్నాయి',
    stationHubs: 'రైల్వే స్టేషన్లు',
    switchStation: 'స్టేషన్ మార్చు',
    myJourney: 'నా ప్రయాణం',
  },

  Kannada: {
    appName: 'ಸ್ಮಾರ್ಟ್‌ರೈಲ್ ನ್ಯಾವಿಗೇಟರ್',
    tagline: 'ನಿಮ್ಮ ರೈಲನ್ನು ತಿಳಿಯಿರಿ. ನಿಮ್ಮ ನಿಲ್ದಾಣವನ್ನು ಅರಿಯಿರಿ. ಎಲ್ಲಿ ನಡೆಯಬೇಕೆಂದು ನಿಖರವಾಗಿ ತಿಳಿಯಿರಿ.',
    knowYourTrain: 'ನಿಮ್ಮ ರೈಲನ್ನು ತಿಳಿಯಿರಿ. ನಿಮ್ಮ ನಿಲ್ದಾಣವನ್ನು ಅರಿಯಿರಿ. ಎಲ್ಲಿ ನಡೆಯಬೇಕೆಂದು ನಿಖರವಾಗಿ ತಿಳಿಯಿರಿ.',
    findMyTrain: 'ನನ್ನ ರೈಲನ್ನು ಹುಡುಕಿ',
    nearbyStations: 'ಹತ್ತಿರದ ರೈಲ್ವೆ ನಿಲ್ದಾಣಗಳು',
    navigateInsideStation: 'ನಿಲ್ದಾಣದ ಒಳಗೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ',
    searchPlaceholder: 'ರೈಲು ಸಂಖ್ಯೆ (ಉದಾ: 12681), ಹೆಸರು ಅಥವಾ ಗಮ್ಯಸ್ಥಾನವನ್ನು ಹುಡುಕಿ...',
    recentSearches: 'ಇತ್ತೀಚಿನ ರೈಲುಗಳು',
    takeMeToMyTrain: 'ನನ್ನನ್ನು ನನ್ನ ರೈಲಿನ ಬಳಿಗೆ ಕೊಂಡೊಯ್ಯಿರಿ',
    startStationNavigation: 'ಸ್ಟೇಷನ್ ನ್ಯಾವಿಗೇಷನ್ ಪ್ರಾರಂಭಿಸಿ',
    whereIsMyTrain: 'ನನ್ನ ರೈಲು ಎಲ್ಲಿದೆ?',
    trackLiveJourney: 'ಲೈವ್ ಪ್ರಯಾಣವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    platformChangedTitle: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಬದಲಾಗಿದೆ',
    platformChangedDesc: 'ನಿಮ್ಮ ರೈಲು ಈಗ ಈ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಆಗಮಿಸುತ್ತಿದೆ:',
    continueNavigation: 'ನ್ಯಾವಿಗೇಷನ್ ಮುಂದುವರಿಸಿ',
    arrivesIn: 'ಆಗಮನಕ್ಕೆ ಉಳಿದ ಸಮಯ',
    arrivingSoon: 'ಶೀಘ್ರದಲ್ಲೇ ಆಗಮಿಸಲಿದೆ — ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ತೆರಳಿ',
    onTime: 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ',
    delayed: 'ವಿಳಂಬವಾಗಿದೆ',
    running: 'ಚಲಿಸುತ್ತಿದೆ',
    platform: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    floor: 'ಮಹಡಿ',
    fastestRoute: 'ವೇಗದ ಮಾರ್ಗ',
    accessibleRoute: 'ಮೆಟ್ಟಿಲುಗಳಿಲ್ಲದ ವೀಲ್‌ಚೇರ್ ಮಾರ್ಗ',
    lowCrowdRoute: 'ಕಡಿಮೆ ಜನಸಂದಣಿಯ ಮಾರ್ಗ',
    distanceFromPlatform: 'ನೀವು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನಿಂದ ಇರುವ ದೂರ',
    takeElevator: 'ಲಿಫ್ಟ್ ಬಳಸಿ',
    takeStairs: 'ಮೆಟ್ಟಿಲುಗಳನ್ನು ಬಳಸಿ',
    turnLeft: 'ಎಡಕ್ಕೆ ತಿರುಗಿ',
    turnRight: 'ಬಲಕ್ಕೆ ತಿರುಗಿ',
    continueStraight: 'ನೇರವಾಗಿ ಮುಂದುವರಿಯಿರಿ',
    arrivedAtDestination: 'ನೀವು ನಿಮ್ಮ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ತಲುಪಿದ್ದೀರಿ',
    dataFreshnessLive: 'ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ',
    updatedSecondsAgo: 'ನವೀಕರಿಸಲಾಗಿದೆ',
    avoidStairs: 'ಮೆಟ್ಟಿಲುಗಳನ್ನು ತಪ್ಪಿಸಿ',
    glassElevatorAvailable: 'ಗ್ಲಾಸ್ ಲಿಫ್ಟ್ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ',
    stationHubs: 'ರೈಲ್ವೆ ನಿಲ್ದಾಣಗಳು',
    switchStation: 'ನಿಲ್ದಾಣ ಬದಲಾಯಿಸಿ',
    myJourney: 'ನನ್ನ ಸಕ್ರಿಯ ಪ್ರಯಾಣ',
  },
};

export function getTranslation(language?: AppLanguage | string): TranslationDictionary {
  if (language && (language as AppLanguage) in TRANSLATIONS) {
    return TRANSLATIONS[language as AppLanguage];
  }
  return TRANSLATIONS.English;
}
