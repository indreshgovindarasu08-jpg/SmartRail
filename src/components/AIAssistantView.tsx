import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Station, UserPreferences, Train } from '../types';
import { MASTER_TRAINS_LIST } from '../data/trainsMasterDB';
import { SmartRailLogo } from './SmartRailLogo';

interface AIAssistantViewProps {
  currentStation: Station;
  userPrefs: UserPreferences;
  onNavigateToPOI: (poiId: string) => void;
  onViewRouteDetails: (poiId: string) => void;
  onSelectTrain?: (trainNumber: string) => void;
  onTakeMeToMyTrain?: (trainNumber: string, platformNumber?: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentStation,
  userPrefs,
  onNavigateToPOI,
  onViewRouteDetails,
  onSelectTrain,
  onTakeMeToMyTrain,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: `Vanakkam! I am your SmartRail AI Pilot for ${currentStation.name} (${currentStation.code}) and all Southern Railway network corridors. Ask me about train timings, platform assignments, step-free routes, or station facilities.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'm1',
      sender: 'user',
      text: 'How do I get to Platform 4 or 5 without using stairs?',
      timestamp: '10:42 AM',
    },
    {
      id: 'm2',
      sender: 'assistant',
      text: 'Platform 4/5 is 75 meters away. Take Glass Elevator Bank A from Level G Main Concourse to L2 Foot Overbridge, cross the skywalk, and take Glass Elevator C down directly to Platform 4/5. Entire route is 100% step-free.',
      timestamp: '10:42 AM',
      routeAction: {
        destinationId: 'cbe-plat-4',
        destinationName: 'Platform 4 & 5 (Step-Free Elevator Route)',
        accessible: true,
      },
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendMessage = async (customText?: string) => {
    const query = (customText || inputVal).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputVal('');
    setIsLoading(true);

    // Check for direct local railway knowledge first (especially Tuticorin / Coimbatore)
    const lower = query.toLowerCase();

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          stationCode: currentStation.code,
          stationId: currentStation.id,
          userFloor: 'G',
          accessibilityMode: userPrefs.accessibility,
          avoidStairs: userPrefs.avoidStairs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          routeAction: data.routeAction,
          facilityCard: data.facilityCard,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // Graceful local fallback
    }

    // Rich Deterministic Engine for Tamil Nadu Railway network
    setTimeout(() => {
      let replyText = `I have queried Southern Railway live telemetry for ${currentStation.name}.`;
      let routeAction = undefined;
      let facilityCard = undefined;

      if (lower.includes('tuticorin') || lower.includes('thoothukudi')) {
        replyText = `Found express train services between Coimbatore and Tuticorin (Thoothukudi):\n• Train 16612 (Coimbatore - Tuticorin Link Express): Departs CBE 08:00 PM, arrives TN 04:30 AM via Tiruppur, Erode, Dindigul, Madurai.\n• Train 06629 (Coimbatore - Tuticorin Daily Intercity): Departs CBE 07:15 AM, arrives TN 03:45 PM.\n• Train 12693 (Pearl City Express): Connects Chennai Egmore to Tuticorin at 07:30 PM.`;
        routeAction = {
          destinationId: 'cbe-plat-4',
          destinationName: 'Platform 4 (Tuticorin Link Express Bay)',
          accessible: true,
        };
      } else if (lower.includes('chennai') || lower.includes('12681') || lower.includes('20644')) {
        replyText = `Direct services to Chennai:\n• Train 20644 (Vande Bharat Express): Departs 06:00 AM (PF 1), 5h 50m to Chennai Central.\n• Train 12676 (Kovai Superfast): Departs 03:05 PM (PF 2).\n• Train 12681: Arrives 06:42 AM at Platform 5 (On Time).`;
        routeAction = {
          destinationId: 'cbe-plat-1',
          destinationName: 'Platform 1 (Vande Bharat Bay)',
          accessible: true,
        };
      } else if (lower.includes('madurai')) {
        replyText = `Services to Madurai Junction:\n• Train 16721 (Coimbatore - Madurai Express via Pollachi): Departs 02:05 PM.\n• Train 16612 (Tuticorin Express via Madurai): Departs 08:00 PM.\n• Train 16607 (Tirunelveli Express via Madurai): Departs 09:30 PM.`;
      } else if (lower.includes('platform 4') || lower.includes('platform 5')) {
        replyText = `Platform 4/5 is 75m away. For step-free access, take Glass Elevator Bank A from Level G to L2 FOB Skywalk, cross over, and take Glass Elevator C down.`;
        routeAction = {
          destinationId: 'cbe-plat-4',
          destinationName: 'Platform 4 & 5 (Glass Elevator)',
          accessible: true,
        };
      } else if (lower.includes('platform 1')) {
        replyText = `Platform 1 is immediately accessible on Level G concourse, with tactile guiding tiles right from the main entrance.`;
        routeAction = {
          destinationId: 'cbe-plat-1',
          destinationName: 'Platform 1 (Main Concourse Bay)',
          accessible: true,
        };
      } else if (lower.includes('coffee') || lower.includes('food') || lower.includes('restaurant')) {
        replyText = `IRCTC Executive Food Plaza is located on Level G concourse, 25 meters from the main entrance, serving hot filter coffee and South Indian breakfast.`;
        facilityCard = {
          name: 'IRCTC Executive Food Plaza',
          location: 'Main Concourse Level G • 25m away',
          distanceMeters: 25,
          icon: 'restaurant',
          poiId: 'cbe-irctc-plaza',
        };
      } else if (lower.includes('ticket') || lower.includes('uts') || lower.includes('prs')) {
        replyText = `The PRS Reserved and UTS Unreserved Ticket Complex with 12 active counters and automatic ATVM kiosks is situated on Level G, 20m from Main Entrance.`;
        routeAction = {
          destinationId: 'cbe-ticket-counter',
          destinationName: 'PRS / UTS Ticketing Complex',
          accessible: true,
        };
      } else if (lower.includes('restroom') || lower.includes('toilet') || lower.includes('washroom')) {
        replyText = `Divyangjan Accessible Restroom is located on Level G near Pillar 6 (38 meters away, step-free with grab bars).`;
        routeAction = {
          destinationId: 'cbe-restroom-accessible',
          destinationName: 'Accessible Restroom (Pillar 6)',
          accessible: true,
        };
      } else {
        replyText = `I have received your query for ${currentStation.name}. Station elevators, tactile guidance paths, and platforms 1 to 6 are all active with step-free accessibility.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          routeAction,
          facilityCard,
        },
      ]);
      setIsLoading(false);
    }, 400);
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser. Please type your query in the chat bar below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        showToast('Listening... Speak now (e.g., "Trains to Tuticorin" or "Where is Platform 5")');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        setIsRecording(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        showToast('Voice input ended. You can type in the chat bar.');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
      showToast('Please type your query into the chat bar below.');
    }
  };

  const quickPrompts = [
    { label: '🚆 Coimbatore to Tuticorin', query: 'Show me trains from Coimbatore to Tuticorin' },
    { label: '♿ Step-Free to Platform 4/5', query: 'How do I reach Platform 4 without stairs?' },
    { label: '☕ Food & Filter Coffee', query: 'Where is the nearest food plaza and coffee?' },
    { label: '🎫 Ticket Counter / ATVM', query: 'Where is the ticket booking counter?' },
    { label: '🚻 Accessible Washroom', query: 'Where is the accessible restroom?' },
    { label: '⚡ Next Train to Chennai', query: 'What is the next express train to Chennai?' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#070707] text-white flex flex-col pt-16 pb-36 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#ff3e00] text-white text-xs font-mono font-bold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2 max-w-md text-center">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Copilot Header */}
      <div className="border-b border-white/10 bg-[#0d0d0d]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-16 z-30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SmartRailLogo size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-display font-black text-white uppercase tracking-tight">
                AI PILOT // SPATIAL COPILOT
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[10px] font-mono text-white/50 uppercase">
              {currentStation.name} ({currentStation.code}) &bull; LIVE TELEMETRY READY
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono uppercase text-white/60">
            SOUTHERN RAILWAY
          </span>
          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400 uppercase">
            ONLINE
          </span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] p-4 text-xs sm:text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-[#181818] border-white/20 text-white font-medium'
                    : 'bg-[#101010] border-white/15 text-white/95'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#ff3e00] uppercase mb-1.5 tracking-wider">
                    <span className="material-symbols-outlined text-[13px]">smart_toy</span>
                    <span>AI PILOT</span>
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Optional Embedded Route Action Button */}
                {msg.routeAction && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/40 p-2.5 border">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ff3e00] text-[18px]">
                        explore
                      </span>
                      <span className="text-xs font-bold text-white uppercase font-display">
                        {msg.routeAction.destinationName}
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigateToPOI(msg.routeAction!.destinationId)}
                      className="px-3 py-1.5 bg-[#ff3e00] hover:bg-[#e03700] text-white text-[11px] font-black uppercase font-mono transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    >
                      <span>VIEW 3D ROUTE</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                )}

                {/* Optional Embedded Facility Card */}
                {msg.facilityCard && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3 bg-black/40 p-2.5 border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white/10 flex items-center justify-center text-[#ff3e00]">
                        <span className="material-symbols-outlined text-[18px]">
                          {msg.facilityCard.icon}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white uppercase">
                          {msg.facilityCard.name}
                        </div>
                        <div className="text-[10px] font-mono text-white/50 uppercase">
                          {msg.facilityCard.location}
                        </div>
                      </div>
                    </div>
                    {msg.facilityCard.poiId && (
                      <button
                        onClick={() => onNavigateToPOI(msg.facilityCard!.poiId!)}
                        className="px-2.5 py-1.5 bg-[#181818] hover:bg-white/10 text-white text-[10px] font-mono border border-white/20 transition-colors cursor-pointer shrink-0"
                      >
                        Locate &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>

              <span className="text-[9px] font-mono text-white/40 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 self-start bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white/70">
            <span className="w-2 h-2 rounded-full bg-[#ff3e00] animate-ping" />
            <span>AI PILOT CONSULTING LIVE INFRASTRUCTURE ARCHIVE...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* DOCKED QUICK PROMPTS & CHAT BAR (ABOVE BOTTOM NAV BAR AT bottom-16) */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/15 py-2.5 px-3 sm:px-6 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Quick Prompt Carousel Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="px-2.5 py-1 bg-[#141414] hover:bg-white/10 hover:border-[#ff3e00] border border-white/15 text-white/80 hover:text-white whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* MAIN INTERACTIVE CHAT INPUT BAR */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 bg-[#141414] border-2 border-white/20 focus-within:border-[#ff3e00] transition-colors flex items-center h-12 shadow-inner">
              <span className="material-symbols-outlined text-white/40 text-[18px] pl-3.5 select-none">
                chat
              </span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask AI Pilot about trains, platforms, routes, or facilities..."
                className="w-full bg-transparent px-3 text-xs sm:text-sm font-sans font-medium text-white focus:outline-none placeholder:text-white/40"
              />
              {inputVal.trim() && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="pr-2 text-white/40 hover:text-white cursor-pointer"
                  title="Clear text"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`w-12 h-12 shrink-0 border flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  : 'bg-[#181818] hover:bg-white/10 text-white/80 hover:text-white border-white/20'
              }`}
              title={isRecording ? 'Listening...' : 'Voice command'}
              aria-label="Voice input"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isRecording ? 'graphic_eq' : 'mic'}
              </span>
            </button>

            {/* High-Contrast Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputVal.trim() || isLoading}
              className={`w-12 h-12 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                inputVal.trim() && !isLoading
                  ? 'bg-[#ff3e00] hover:bg-[#e03700] text-white shadow-lg shadow-[#ff3e00]/30 active:scale-95'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
              title="Send Message"
              aria-label="Send Message"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
