import React, { useState, useEffect } from 'react';
import { UserPreferences, Station, TabType } from '../types';
import { SmartRailLogo } from './SmartRailLogo';
import { mockStations } from '../data/stationsData';
import { userService, ADMIN_EMAIL } from '../services/railway/userService';

interface LoginPageProps {
  currentUser: UserPreferences;
  currentStation: Station;
  onLoginSuccess: (user: Partial<UserPreferences>) => void;
  onLogout: () => void;
  onNavigate: (tab: TabType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  currentStation,
  onLoginSuccess,
  onLogout,
  onNavigate,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('email');

  // Sign in fields
  const [signInIdentifier, setSignInIdentifier] = useState(
    currentUser.isLoggedIn ? currentUser.email : 'indreshgovindarasu08@gmail.com'
  );
  const [signInPassword, setSignInPassword] = useState('smartrail2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [regName, setRegName] = useState(currentUser.isLoggedIn ? currentUser.name : '');
  const [regEmail, setRegEmail] = useState(currentUser.isLoggedIn ? currentUser.email : '');
  const [regMobile, setRegMobile] = useState(currentUser.phoneNumber || '');
  const [regPassword, setRegPassword] = useState('');
  const [regStationCode, setRegStationCode] = useState(currentStation.code || 'CBE');
  const [regCategory, setRegCategory] = useState<'daily' | 'express' | 'student' | 'senior' | 'tourist'>('express');
  const [regAccessibility, setRegAccessibility] = useState<UserPreferences['accessibility']>('Standard');
  const [regAvoidStairs, setRegAvoidStairs] = useState(false);

  // OTP flow state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(30);

  // UI status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Direct URL for sharing or opening the page directly
  const directLinkUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#login`
    : 'https://ais-dev-a6t7fdyexeqogau3xhaypc-609798137520.asia-east1.run.app/#login';

  // OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpInput && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpInput, otpTimer]);

  const handleCopyDirectLink = async () => {
    try {
      await navigator.clipboard.writeText(directLinkUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      // fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleRequestOtp = (mobileOrEmail: string) => {
    if (!mobileOrEmail.trim()) {
      setErrorMessage('Please enter a valid mobile number or email address');
      return;
    }
    const cleanMobile = mobileOrEmail.replace(/\D/g, '');
    if (cleanMobile.length > 0 && cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setErrorMessage(null);
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setShowOtpInput(true);
    setOtpTimer(45);
    setSuccessMessage(`One-Time Password (OTP) dispatched! For demo testing, code is: ${mockOtp}`);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInIdentifier.trim()) {
      setErrorMessage('Please enter your registered mobile number or email');
      return;
    }

    if (showOtpInput) {
      if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
        setErrorMessage(`Invalid OTP code entered. Please enter ${generatedOtp || '123456'}`);
        return;
      }
    } else {
      if (!signInPassword) {
        setErrorMessage('Please enter your password or PIN');
        return;
      }
    }

    const isEmail = signInIdentifier.includes('@');
    const userEmail = isEmail ? signInIdentifier.trim().toLowerCase() : currentUser.email || `${signInIdentifier}@smartrail.in`;
    const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

    const updatedUser: Partial<UserPreferences> = {
      isLoggedIn: true,
      name: currentUser.name || (isEmail ? signInIdentifier.split('@')[0] : 'Commuter'),
      email: userEmail,
      phoneNumber: !isEmail ? signInIdentifier.replace(/\D/g, '').slice(0, 10) : currentUser.phoneNumber || '9876543210',
      avatar: (currentUser.name || (isAdmin ? 'IG' : 'CR')).slice(0, 2).toUpperCase(),
      role: isAdmin ? 'admin' : 'user',
    };

    userService.registerOrUpdateUser(updatedUser);
    onLoginSuccess(updatedUser);
    setSuccessMessage(isAdmin ? 'Successfully signed in as Site Owner & Admin! Admin Console is now unlocked.' : 'Successfully signed in! Welcome back to SmartRail Navigator.');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address (e.g. commuter@example.com)');
      return;
    }

    const cleanMobile = regMobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }

    if (!showOtpInput) {
      handleRequestOtp(cleanMobile);
      return;
    }

    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setErrorMessage(`Invalid verification OTP. Please enter ${generatedOtp || '123456'}`);
      return;
    }

    const initials = regName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    const registeredUser: Partial<UserPreferences> = {
      isLoggedIn: true,
      name: regName.trim(),
      email: cleanEmail,
      phoneNumber: cleanMobile,
      avatar: initials || 'SR',
      accessibility: regAccessibility,
      avoidStairs: regAvoidStairs,
      role: isAdmin ? 'admin' : 'user',
    };

    userService.registerOrUpdateUser(registeredUser);
    onLoginSuccess(registeredUser);
    setSuccessMessage(isAdmin ? 'Admin account registered & verified! Full control console unlocked.' : 'Registration successful! Your commuter profile and mobile number are verified.');
  };

  const handleQuickDemoLogin = (profile: {
    name: string;
    email: string;
    phone: string;
    station: string;
    avatar: string;
    role?: 'admin' | 'user';
  }) => {
    const isAdmin = profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || profile.role === 'admin';
    const demoUser: Partial<UserPreferences> = {
      isLoggedIn: true,
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phone,
      avatar: profile.avatar,
      role: isAdmin ? 'admin' : 'user',
    };
    userService.registerOrUpdateUser(demoUser);
    onLoginSuccess(demoUser);
    setSuccessMessage(`Signed in as ${profile.name} (${profile.email})${isAdmin ? ' • Admin Access Enabled' : ''}`);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-20 pb-32 font-sans selection:bg-[#ff3e00] selection:text-white">
      {/* Top Banner with Direct Page Link */}
      <div className="bg-[#121212] border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('explore')}
              className="flex items-center gap-1 text-white/70 hover:text-white font-mono uppercase tracking-wider text-[11px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Home</span>
            </button>
            <span className="text-white/20">/</span>
            <span className="font-mono text-[#ff3e00] uppercase font-bold text-[11px]">
              Dedicated Login & Registration Page
            </span>
          </div>

          {/* Direct Link Box & Copy Button */}
          <div className="flex items-center gap-2 bg-black/60 border border-white/15 px-3 py-1.5 rounded-none font-mono text-[11px]">
            <span className="text-white/40 hidden md:inline">Direct Link:</span>
            <span className="text-[#00f0ff] truncate max-w-[220px] sm:max-w-none">{directLinkUrl}</span>
            <button
              onClick={handleCopyDirectLink}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer border ${
                copiedLink
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-white/10 hover:bg-white hover:text-black border-white/20 text-white'
              }`}
              title="Copy direct URL to clipboard"
            >
              {copiedLink ? '✓ Copied' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <SmartRailLogo size="lg" showText={true} />
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-white/50 mt-1">
            Southern Railway Digital Commuter Services • Verified Access
          </p>
        </div>

        {/* First-Time User Registration Requirement Notice */}
        {!currentUser.isLoggedIn && (
          <div className="mb-6 p-4 bg-gradient-to-r from-[#1c120c] via-[#161616] to-[#121212] border-2 border-[#ff3e00] text-xs font-mono">
            <div className="flex items-center gap-2 text-[#ff3e00] font-black uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>First-Time Commuter Access: Registration / Login Required</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              Welcome to SmartRail Navigator! To access live train telemetry, 3D station digital twins, and offline navigation across Tamil Nadu, all users must register or sign in with their <strong>Email</strong> and <strong>10-digit Mobile Number</strong> below.
            </p>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0">check_circle</span>
            <div className="flex-1">
              <p className="font-bold">{successMessage}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => onNavigate('explore')}
                  className="px-3 py-1 bg-emerald-500 text-black font-bold uppercase text-[10px] tracking-wider cursor-pointer hover:bg-emerald-400"
                >
                  Go to Home Screen →
                </button>
                <button
                  onClick={() => onNavigate('user')}
                  className="px-3 py-1 bg-[#00f0ff] text-black font-bold uppercase text-[10px] tracking-wider cursor-pointer hover:bg-[#00d0df]"
                >
                  Open My User Page & Pass →
                </button>
                {(currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || currentUser.role === 'admin') && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="px-3 py-1 bg-rose-500 text-white font-bold uppercase text-[10px] tracking-wider cursor-pointer hover:bg-rose-400"
                  >
                    ★ Open Admin Console (Owner Only) →
                  </button>
                )}
                <button
                  onClick={() => onNavigate('train_search')}
                  className="px-3 py-1 bg-white/10 text-white font-bold uppercase text-[10px] tracking-wider cursor-pointer hover:bg-white hover:text-black"
                >
                  Track Live Trains →
                </button>
              </div>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-white cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-start gap-3">
            <span className="material-symbols-outlined text-rose-400 text-[20px] shrink-0">error</span>
            <div className="flex-1">
              <p className="font-bold">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Currently Logged In Status Card */}
        {currentUser.isLoggedIn && (
          <div className="mb-8 p-6 bg-[#121212] border-2 border-emerald-500/40 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#ff3e00] to-amber-500 text-white font-display font-black text-xl flex items-center justify-center border border-white/20">
                  {currentUser.avatar || 'CR'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-widest">
                      ACTIVE COMMUTER SESSION
                    </span>
                    <span className="text-xs text-white/40 font-mono">ID: SR-2026-{(currentUser.phoneNumber || '9876543210').slice(-4)}</span>
                  </div>
                  <h2 className="text-xl font-display font-black text-white uppercase mt-0.5">
                    {currentUser.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/60 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-white/40">mail</span>
                      {currentUser.email}
                    </span>
                    {currentUser.phoneNumber && (
                      <span className="flex items-center gap-1 text-[#00f0ff]">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        +91 {currentUser.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-4 py-2 bg-white/10 hover:bg-white hover:text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border border-white/20"
                >
                  Commuter Settings
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border border-rose-500/40"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Auth Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Center Form Panel (8 cols) */}
          <div className="lg:col-span-8 bg-[#101010] border border-white/15 p-6 sm:p-8">
            {/* Mode Tab Switcher */}
            <div className="flex border-b border-white/15 mb-6">
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all border-b-2 flex items-center justify-center gap-2 ${
                  authMode === 'signin'
                    ? 'border-[#ff3e00] text-white bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Sign In to Account</span>
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all border-b-2 flex items-center justify-center gap-2 ${
                  authMode === 'register'
                    ? 'border-[#ff3e00] text-white bg-white/5'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Register with Mobile & Email</span>
              </button>
            </div>

            {/* TAB 1: SIGN IN */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-5">
                {/* Login Method Toggle */}
                <div className="flex items-center justify-between text-xs font-mono pb-2">
                  <span className="text-white/60">Choose sign-in credential:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('email');
                        setShowOtpInput(false);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-mono cursor-pointer border ${
                        loginMethod === 'email'
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-black text-white/60 border-white/20 hover:text-white'
                      }`}
                    >
                      Email & Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('mobile');
                      }}
                      className={`px-2.5 py-1 text-[11px] font-mono cursor-pointer border ${
                        loginMethod === 'mobile'
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-black text-white/60 border-white/20 hover:text-white'
                      }`}
                    >
                      Mobile + OTP
                    </button>
                  </div>
                </div>

                {/* Identifier Input */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                    {loginMethod === 'email' ? 'Email Address' : '10-Digit Mobile Number'}
                  </label>
                  <div className="relative">
                    {loginMethod === 'mobile' && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#ff3e00] font-bold">
                        +91
                      </span>
                    )}
                    <input
                      type={loginMethod === 'email' ? 'email' : 'tel'}
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      placeholder={
                        loginMethod === 'email'
                          ? 'indreshgovindarasu08@gmail.com'
                          : '9876543210'
                      }
                      className={`w-full bg-[#181818] border border-white/20 text-white text-sm py-2.5 px-3 focus:outline-none focus:border-[#ff3e00] font-mono ${
                        loginMethod === 'mobile' ? 'pl-12' : ''
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Password or OTP Section */}
                {loginMethod === 'email' && !showOtpInput ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/70">
                        Password / Commuter PIN
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          handleRequestOtp(signInIdentifier);
                        }}
                        className="text-[11px] font-mono text-[#00f0ff] hover:underline cursor-pointer"
                      >
                        Sign in via Instant OTP instead?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-[#181818] border border-white/20 text-white text-sm py-2.5 px-3 pr-10 focus:outline-none focus:border-[#ff3e00] font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/70">
                        6-Digit Verification Code (OTP)
                      </label>
                      {generatedOtp && (
                        <button
                          type="button"
                          onClick={() => setOtpCode(generatedOtp)}
                          className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 border border-emerald-500/40 cursor-pointer hover:bg-emerald-900"
                        >
                          Auto-fill: {generatedOtp}
                        </button>
                      )}
                    </div>
                    {!showOtpInput ? (
                      <button
                        type="button"
                        onClick={() => handleRequestOtp(signInIdentifier)}
                        className="w-full py-2.5 bg-white/10 hover:bg-white hover:text-black border border-white/20 text-xs font-mono uppercase font-bold tracking-wider cursor-pointer transition-colors"
                      >
                        Send One-Time Password (OTP) to +91 {signInIdentifier || '...'}
                      </button>
                    ) : (
                      <div>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 742918"
                          className="w-full bg-[#181818] border border-white/20 text-white text-center tracking-[0.5em] text-lg py-2.5 px-3 focus:outline-none focus:border-[#00f0ff] font-mono"
                          required
                        />
                        <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mt-1.5">
                          <span>
                            {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Did not receive code?'}
                          </span>
                          <button
                            type="button"
                            disabled={otpTimer > 0}
                            onClick={() => handleRequestOtp(signInIdentifier)}
                            className="text-[#ff3e00] hover:underline disabled:opacity-40 disabled:hover:no-underline cursor-pointer"
                          >
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Remember & Options */}
                <div className="flex items-center justify-between text-xs font-mono text-white/70 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-[#ff3e00]"
                    />
                    <span>Remember on this browser</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInPassword('smartrail2026');
                      setSuccessMessage('Temporary test PIN restored: smartrail2026');
                    }}
                    className="hover:underline text-white/50 cursor-pointer"
                  >
                    Reset Password
                  </button>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#ff3e00] hover:bg-[#e03700] text-white font-mono font-black uppercase text-sm tracking-widest transition-all cursor-pointer shadow-lg shadow-[#ff3e00]/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Sign In to SmartRail</span>
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="p-3 bg-[#ff3e00]/10 border border-[#ff3e00]/30 text-white/80 text-xs font-mono">
                  Registration registers your Southern Railway profile with your <strong>email</strong> and <strong>mobile number</strong> for real-time live platform SMS notices and journey tracking.
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Indresh Govindarasu"
                    className="w-full bg-[#181818] border border-white/20 text-white text-sm py-2 px-3 focus:outline-none focus:border-[#ff3e00] font-sans"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                    Email Address * (For e-tickets & schedule updates)
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. indreshgovindarasu08@gmail.com"
                    className="w-full bg-[#181818] border border-white/20 text-white text-sm py-2 px-3 focus:outline-none focus:border-[#ff3e00] font-mono"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                    10-Digit Mobile Number * (Indian Railways SMS & OTP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#ff3e00] font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-[#181818] border border-white/20 text-white text-sm py-2 px-3 pl-12 focus:outline-none focus:border-[#ff3e00] font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Home / Preferred Railway Station */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                    Primary Station Hub
                  </label>
                  <select
                    value={regStationCode}
                    onChange={(e) => setRegStationCode(e.target.value)}
                    className="w-full bg-[#181818] border border-white/20 text-white text-sm py-2 px-3 focus:outline-none focus:border-[#ff3e00] font-mono"
                  >
                    {mockStations.map((s) => (
                      <option key={s.id} value={s.code} className="bg-neutral-900 text-white">
                        {s.name} ({s.code}) - {s.location}
                      </option>
                    ))}
                    <option value="TN" className="bg-neutral-900 text-white">
                      Tuticorin / Thoothukudi (TN) - Southern Railway
                    </option>
                    <option value="MS" className="bg-neutral-900 text-white">
                      Chennai Egmore (MS) - Southern Railway
                    </option>
                  </select>
                </div>

                {/* Commuter Type */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'express', label: 'Express Commuter', icon: 'train' },
                    { id: 'daily', label: 'Daily Season Pass', icon: 'badge' },
                    { id: 'student', label: 'Student / Scholar', icon: 'school' },
                    { id: 'senior', label: 'Senior Citizen', icon: 'elderly' },
                    { id: 'tourist', label: 'State Tourist', icon: 'luggage' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRegCategory(cat.id as any)}
                      className={`p-2 border text-[11px] font-mono uppercase flex items-center gap-1.5 cursor-pointer text-left ${
                        regCategory === cat.id
                          ? 'border-[#ff3e00] bg-[#ff3e00]/10 text-white font-bold'
                          : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#ff3e00]">
                        {cat.icon}
                      </span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Accessibility Assistance Profile */}
                <div className="border border-white/10 p-3 bg-black/40 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider block">
                    Accessibility & Station Navigation Preferences
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {[
                      { id: 'Standard', label: 'Standard Route' },
                      { id: 'Wheelchair', label: 'Wheelchair / Ramp' },
                      { id: 'Visual Assist', label: 'High Contrast / Audio' },
                      { id: 'Hearing Assist', label: 'Visual Display Priority' },
                    ].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-white/70">
                        <input
                          type="radio"
                          name="accOpt"
                          value={opt.id}
                          checked={regAccessibility === opt.id}
                          onChange={() => setRegAccessibility(opt.id as any)}
                          className="accent-[#ff3e00]"
                        />
                        <span className="text-[11px]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-xs font-mono text-white/70 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regAvoidStairs}
                      onChange={(e) => setRegAvoidStairs(e.target.checked)}
                      className="accent-[#ff3e00]"
                    />
                    <span className="text-[11px]">Strictly Avoid Stairs (Use Lifts & Skywalk Ramps)</span>
                  </label>
                </div>

                {/* OTP Verification Step */}
                {showOtpInput ? (
                  <div className="border border-[#00f0ff]/40 p-3 bg-[#00f0ff]/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#00f0ff] font-bold">
                        Enter OTP sent to +91 {regMobile}:
                      </span>
                      {generatedOtp && (
                        <button
                          type="button"
                          onClick={() => setOtpCode(generatedOtp)}
                          className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 border border-emerald-500/40 cursor-pointer"
                        >
                          Use Code: {generatedOtp}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit OTP"
                      className="w-full bg-[#181818] border border-white/20 text-white text-center tracking-[0.4em] text-base py-2 px-3 font-mono"
                      required
                    />
                  </div>
                ) : null}

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#ff3e00] to-amber-600 hover:from-[#e03700] hover:to-amber-500 text-white font-mono font-black uppercase text-sm tracking-widest transition-all cursor-pointer shadow-lg shadow-[#ff3e00]/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>{showOtpInput ? 'Confirm & Complete Registration' : 'Verify Mobile via OTP & Register'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Sidebar: One-Click Instant Demo Profiles & Commuter Perks (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick 1-Click Commuter Profiles */}
            <div className="bg-[#121212] border border-white/15 p-5">
              <div className="text-[10px] font-mono font-bold text-[#ff3e00] uppercase tracking-widest mb-1">
                INSTANT COMMUTER ACCESS
              </div>
              <h3 className="text-sm font-display font-black text-white uppercase tracking-tight mb-3">
                1-Click Demo Profiles
              </h3>
              <p className="text-xs font-mono text-white/50 mb-4 leading-relaxed">
                Click any profile to instantly authenticate and test real-time train tracking across Tamil Nadu:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    name: 'Indresh Govindarasu',
                    email: 'indreshgovindarasu08@gmail.com',
                    phone: '9876543210',
                    station: 'Coimbatore & Tuticorin',
                    avatar: 'IG',
                    role: 'Express Commuter (CBE-TN)',
                  },
                  {
                    name: 'Priya Sundaram',
                    email: 'priya.rail@southernrail.in',
                    phone: '9840123456',
                    station: 'Chennai Central (MAS)',
                    avatar: 'PS',
                    role: 'Vande Bharat Frequent Traveller',
                  },
                  {
                    name: 'Dr. Ramanathan K',
                    email: 'raman.mdu@railnet.in',
                    phone: '9789012345',
                    station: 'Madurai Jn (MDU)',
                    avatar: 'RK',
                    role: 'Wheelchair Assistance User',
                  },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    onClick={() => handleQuickDemoLogin(demo)}
                    className="w-full p-3 bg-black border border-white/15 hover:border-[#ff3e00] hover:bg-white/5 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 group-hover:bg-[#ff3e00] group-hover:text-white text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-white/20 transition-colors">
                        {demo.avatar}
                      </div>
                      <div className="truncate flex-1">
                        <div className="text-xs font-display font-black text-white group-hover:text-[#ff3e00] transition-colors truncate">
                          {demo.name}
                        </div>
                        <div className="text-[10px] font-mono text-white/50 truncate">
                          {demo.email}
                        </div>
                        <div className="text-[10px] font-mono text-[#00f0ff] mt-0.5">
                          📱 +91 {demo.phone} • {demo.role}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Commuter Account Perks Bento Box */}
            <div className="bg-[#121212] border border-white/15 p-5">
              <div className="text-[10px] font-mono font-bold text-[#00f0ff] uppercase tracking-widest mb-3">
                COMMUTER REGISTRATION BENEFITS
              </div>
              <ul className="space-y-3 text-xs font-mono text-white/70">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0 mt-0.5">
                    notifications_active
                  </span>
                  <span>Instant SMS and audio alerts for platform changes and train delays</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0 mt-0.5">
                    near_me
                  </span>
                  <span>Turn-by-turn AR spatial indoor wayfinding across 15+ TN stations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0 mt-0.5">
                    accessible
                  </span>
                  <span>Ramp & lift-only routing tailored to mobility assistance needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0 mt-0.5">
                    train
                  </span>
                  <span>Direct tracking for Coimbatore-Tuticorin Link Express & Southern Expresses</span>
                </li>
              </ul>
            </div>

            {/* Direct Navigation Links */}
            <div className="border border-white/10 p-4 bg-black/30 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('explore')}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono uppercase tracking-wider text-center border border-white/15 transition-colors cursor-pointer"
              >
                ← Return to Master Home Screen
              </button>
              <button
                onClick={() => onNavigate('train_search')}
                className="w-full py-2 bg-[#ff3e00]/10 hover:bg-[#ff3e00]/20 text-[#ff3e00] text-xs font-mono uppercase tracking-wider text-center border border-[#ff3e00]/30 transition-colors cursor-pointer font-bold"
              >
                Check Coimbatore-Tuticorin Live Trains →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
