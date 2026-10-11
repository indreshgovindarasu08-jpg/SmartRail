import React, { useState } from 'react';
import { UserPreferences, Station } from '../types';
import { SmartRailLogo } from './SmartRailLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserPreferences;
  currentStation: Station;
  onLoginSuccess: (updatedUser: Partial<UserPreferences>) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentStation,
  onLoginSuccess,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser.phoneNumber || '');
  const [preferredStationCode, setPreferredStationCode] = useState(currentStation.code || 'CBE');
  const [mobilityProfile, setMobilityProfile] = useState<UserPreferences['accessibility']>(
    currentUser.accessibility || 'Standard'
  );
  
  // OTP flow state
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateMobile = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const validateEmail = (mail: string) => {
    return /\S+@\S+\.\S+/.test(mail);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (authMode === 'REGISTER' && !name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!validateMobile(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsSubmitting(true);
    // Generate simulated 4-digit OTP
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mockOtp);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('OTP');
      setSuccessMessage(`OTP sent to +91 ${cleanMobile} and ${email}. (Demo OTP: ${mockOtp})`);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpCode !== generatedOtp && otpCode !== '1234') {
      setErrorMessage(`Incorrect verification code. Please enter ${generatedOtp} or 1234`);
      return;
    }

    // Save profile
    const initials = (name.trim() || email.split('@')[0])
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SR';

    const updated: Partial<UserPreferences> = {
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      phoneNumber: mobileNumber.replace(/\D/g, ''),
      avatar: initials,
      isLoggedIn: true,
      accessibility: mobilityProfile,
      avoidStairs: mobilityProfile === 'Wheelchair',
    };

    try {
      localStorage.setItem('smartrail_user_auth', JSON.stringify(updated));
    } catch (e) {}

    onLoginSuccess(updated);
    setSuccessMessage('Successfully authenticated! Welcome to SmartRail Navigator.');
    setTimeout(() => {
      onClose();
      setStep('FORM');
    }, 800);
  };

  const handleQuickDemoLogin = (role: 'commuter' | 'wheelchair') => {
    const demoProfile: Partial<UserPreferences> = {
      name: role === 'wheelchair' ? 'Kavitha Raman (Wheelchair Access)' : 'Indresh Govindarasu',
      email: role === 'wheelchair' ? 'kavitha.r@smartrail.app' : 'indreshgovindarasu08@gmail.com',
      phoneNumber: '9842145678',
      avatar: role === 'wheelchair' ? 'KR' : 'IG',
      isLoggedIn: true,
      accessibility: role === 'wheelchair' ? 'Wheelchair' : 'Standard',
      avoidStairs: role === 'wheelchair',
    };

    try {
      localStorage.setItem('smartrail_user_auth', JSON.stringify(demoProfile));
    } catch (e) {}

    onLoginSuccess(demoProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/20 shadow-2xl p-6 sm:p-8 my-8 text-white space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/20"
          aria-label="Close dialog"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Brand Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex justify-center">
            <SmartRailLogo size="lg" showText={true} />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight text-white mt-3">
            {currentUser.isLoggedIn
              ? 'COMMUTER ACCOUNT PORTAL'
              : authMode === 'REGISTER'
              ? 'REGISTER NEW COMMUTER'
              : 'RAILWAY COMMUTER SIGN IN'}
          </h2>
          <p className="text-xs text-white/60 font-sans max-w-sm mx-auto">
            {currentUser.isLoggedIn
              ? 'Manage your registered email, mobile number, and mobility routing preferences.'
              : 'Register your email & mobile number for synchronized journeys, live platform SMS alerts & offline navigation.'}
          </p>
        </div>

        {/* If already logged in, show account info and Logout option */}
        {currentUser.isLoggedIn ? (
          <div className="space-y-4 pt-2">
            <div className="bg-[#141414] border border-white/15 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white text-black font-display font-black text-lg flex items-center justify-center border border-white">
                  {currentUser.avatar || 'SR'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white uppercase">{currentUser.name}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-xs font-mono text-white/60">{currentUser.email}</div>
                  {currentUser.phoneNumber && (
                    <div className="text-xs font-mono text-[#00f0ff] mt-0.5">
                      +91 {currentUser.phoneNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-white/40 block text-[9px]">MOBILITY MODE:</span>
                  <span className="text-white font-bold">{currentUser.accessibility}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px]">STAIRS PREFERENCE:</span>
                  <span className="text-white font-bold">{currentUser.avoidStairs ? 'AVOID STAIRS (ELEVATOR)' : 'ALL PATHS'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  onLogout();
                  try {
                    localStorage.removeItem('smartrail_user_auth');
                  } catch (e) {}
                  setSuccessMessage('Logged out successfully.');
                  setTimeout(() => setSuccessMessage(''), 2000);
                }}
                className="flex-1 py-3 bg-[#181818] hover:bg-rose-950/40 hover:text-rose-300 border border-white/20 text-xs font-mono font-bold uppercase transition-colors cursor-pointer text-center"
              >
                Sign Out / Switch Account
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Continue to Journey
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Login / Register Tab Switcher */}
            {step === 'FORM' && (
              <div className="flex border border-white/20 bg-black/60 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    authMode === 'LOGIN'
                      ? 'bg-white text-black font-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    authMode === 'REGISTER'
                      ? 'bg-white text-black font-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Register (New User)
                </button>
              </div>
            )}

            {/* Error & Success Banners */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-rose-400">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Step 1: Input Form */}
            {step === 'FORM' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {authMode === 'REGISTER' && (
                  <div>
                    <label className="block text-[10px] font-mono text-white/60 uppercase tracking-widest mb-1.5">
                      Full Name
                    </label>
                    <div className="relative flex items-center bg-[#141414] border border-white/20 focus-within:border-[#ff3e00]">
                      <span className="material-symbols-outlined text-white/40 text-[18px] pl-3">person</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Indresh Govindarasu"
                        required={authMode === 'REGISTER'}
                        className="w-full bg-transparent px-3 py-2.5 text-xs font-bold text-white focus:outline-none placeholder:text-white/30"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-mono text-white/60 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <div className="relative flex items-center bg-[#141414] border border-white/20 focus-within:border-[#ff3e00]">
                    <span className="material-symbols-outlined text-white/40 text-[18px] pl-3">mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. indresh@example.com"
                      required
                      className="w-full bg-transparent px-3 py-2.5 text-xs font-bold text-white focus:outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Mobile Number with +91 indicator */}
                <div>
                  <label className="block text-[10px] font-mono text-white/60 uppercase tracking-widest mb-1.5">
                    Mobile Number (10 Digits)
                  </label>
                  <div className="relative flex items-center bg-[#141414] border border-white/20 focus-within:border-[#ff3e00]">
                    <span className="px-3 text-xs font-mono font-bold text-[#ff3e00] border-r border-white/10">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      required
                      className="w-full bg-transparent px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none placeholder:text-white/30"
                    />
                  </div>
                  <span className="text-[10px] text-white/40 font-mono mt-1 block">
                    Realtime platform gate changes & train PNR alerts will be dispatched here.
                  </span>
                </div>

                {/* Mobility routing preference */}
                <div>
                  <label className="block text-[10px] font-mono text-white/60 uppercase tracking-widest mb-1.5">
                    Accessibility / Step-Free Preference
                  </label>
                  <select
                    value={mobilityProfile}
                    onChange={(e) => setMobilityProfile(e.target.value as any)}
                    className="w-full bg-[#141414] border border-white/20 text-white text-xs font-mono px-3 py-2.5 focus:outline-none focus:border-[#ff3e00]"
                  >
                    <option value="Standard">Standard Commuter (Stairs, Escalators & FOB)</option>
                    <option value="Wheelchair">Wheelchair Access (Ramps, Glass Elevators, Step-Free)</option>
                    <option value="Visual Assist">Visual Assist (Tactile Pavers, High Contrast)</option>
                    <option value="Hearing Assist">Hearing Assist (Visual Telemetry Flash)</option>
                  </select>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#ff3e00]/20 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>{isSubmitting ? 'GENERATING OTP...' : authMode === 'REGISTER' ? 'REGISTER & SEND OTP' : 'VERIFY & SIGN IN'}</span>
                </button>
              </form>
            ) : (
              /* Step 2: OTP Entry */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-[#141414] border border-white/10 p-3 text-center space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">ENTER 4-DIGIT VERIFICATION CODE</span>
                  <div className="text-xs text-white/80 font-mono">
                    Dispatched to +91 {mobileNumber} &amp; {email}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • •"
                    autoFocus
                    className="w-full bg-[#141414] border-2 border-white/25 focus:border-[#ff3e00] text-center text-2xl font-mono font-black text-white py-3 tracking-[0.5em] focus:outline-none"
                  />
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/50 mt-1.5">
                    <span>Demo OTP: <strong className="text-[#00f0ff]">{generatedOtp || '1234'}</strong></span>
                    <button
                      type="button"
                      onClick={() => setStep('FORM')}
                      className="text-[#ff3e00] hover:underline cursor-pointer"
                    >
                      Change Details
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#00ff66] hover:bg-[#00d856] text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>CONFIRM &amp; ENTER SMARTRAIL</span>
                </button>
              </form>
            )}

            {/* Quick One-Tap Demo Profiles */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block text-center">
                OR INSTANT ONE-TAP ACCESS:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('commuter')}
                  className="p-2.5 bg-[#141414] hover:bg-white/10 border border-white/15 text-left transition-colors cursor-pointer group"
                >
                  <div className="text-[10px] font-mono font-bold text-white group-hover:text-[#ff3e00]">
                    ⚡ Commuter Login
                  </div>
                  <div className="text-[9px] text-white/50 font-mono">indresh.govindarasu@...</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('wheelchair')}
                  className="p-2.5 bg-[#141414] hover:bg-white/10 border border-white/15 text-left transition-colors cursor-pointer group"
                >
                  <div className="text-[10px] font-mono font-bold text-white group-hover:text-[#00f0ff]">
                    ♿ Wheelchair Profile
                  </div>
                  <div className="text-[9px] text-white/50 font-mono">Step-free ramp priority</div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
