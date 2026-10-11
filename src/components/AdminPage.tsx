import React, { useState, useEffect } from 'react';
import { UserPreferences, Station, TabType } from '../types';
import { userService, RegisteredUserRecord, ADMIN_EMAIL } from '../services/railway/userService';
import { railwayEvents } from '../services/railway/railwayDataService';
import { MASTER_TRAINS_LIST } from '../data/trainsMasterDB';
import { SmartRailLogo } from './SmartRailLogo';
import { mockStations } from '../data/stationsData';

interface AdminPageProps {
  currentUser: UserPreferences;
  currentStation: Station;
  onUpdateUserPrefs: (prefs: Partial<UserPreferences>) => void;
  onNavigate: (tab: TabType) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  currentStation,
  onUpdateUserPrefs,
  onNavigate,
}) => {
  // Check if current user is the owner/admin
  const isOwnerEmail = currentUser.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return isOwnerEmail || currentUser.role === 'admin';
  });

  // Admin passcode login gate state
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // Active admin section tab
  const [adminTab, setAdminTab] = useState<'users' | 'dispatcher' | 'telemetry' | 'audit'>('users');

  // Users management state
  const [userList, setUserList] = useState<RegisteredUserRecord[]>(() => userService.getAllUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserStation, setNewUserStation] = useState('Coimbatore Junction (CBE)');

  // Train dispatcher state
  const [trains, setTrains] = useState(MASTER_TRAINS_LIST.slice(0, 15));
  const [selectedTrainForEdit, setSelectedTrainForEdit] = useState<string>('16612'); // Coimbatore to Tuticorin
  const [newPlatformNumber, setNewPlatformNumber] = useState('2');
  const [delayToAdd, setDelayToAdd] = useState('10');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<Array<{ time: string; action: string; user: string }>>([
    { time: 'Just now', action: 'Admin Console Opened', user: ADMIN_EMAIL },
    { time: '10 mins ago', action: 'Coimbatore-Tuticorin Link Express #16612 Telemetry Synced', user: 'SYSTEM' },
    { time: '25 mins ago', action: 'New User Registered: indreshgovindarasu08@gmail.com', user: 'AUTH_GATE' },
    { time: '1 hour ago', action: 'Salem Division Sensor Mesh Calibrated', user: 'SYSTEM' },
  ]);

  useEffect(() => {
    setUserList(userService.getAllUsers());
  }, [adminTab]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcodeAttempt.trim();
    // Accept owner email confirmation or master passcode
    if (
      clean.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      clean === 'admin123' ||
      clean === 'smartrail2026' ||
      clean === 'admin'
    ) {
      setIsAdminUnlocked(true);
      setAdminAuthError(null);
      onUpdateUserPrefs({
        role: 'admin',
        email: ADMIN_EMAIL,
        name: 'Indresh Govindarasu (Admin)',
      });
      addAuditLog(`Admin cleared access via passcode/email verification`);
    } else {
      setAdminAuthError('Invalid Admin Master Key. Only indreshgovindarasu08@gmail.com has authorization.');
    }
  };

  const addAuditLog = (action: string) => {
    const time = new Date().toLocaleTimeString();
    setAuditLogs((prev) => [{ time, action, user: ADMIN_EMAIL }, ...prev.slice(0, 19)]);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const registered = userService.registerOrUpdateUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phoneNumber: newUserPhone.replace(/\D/g, '').slice(0, 10),
      isLoggedIn: true,
    });

    setUserList(userService.getAllUsers());
    setNewUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setStatusFeedback(`Created user record for ${registered.name}`);
    addAuditLog(`Created user ${registered.email}`);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete user ${name}?`)) {
      userService.deleteUser(id);
      setUserList(userService.getAllUsers());
      setStatusFeedback(`Deleted user record for ${name}`);
      addAuditLog(`Deleted user ${name} (${id})`);
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  const handleToggleUserStatus = (id: string) => {
    const updated = userService.toggleUserStatus(id);
    if (updated) {
      setUserList(userService.getAllUsers());
      setStatusFeedback(`User ${updated.name} status updated to ${updated.status}`);
      addAuditLog(`Updated user ${updated.name} to ${updated.status}`);
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,PhoneNumber,Station,Role,Status,RegisteredAt\n';
    const rows = userList
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.email}","${u.phoneNumber}","${u.station}","${u.role}","${u.status}","${u.registeredAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartrail_registered_users_${Date.now()}.csv`;
    a.click();
    addAuditLog('Exported Commuters Database CSV');
  };

  const handleDispatchPlatformChange = () => {
    const targetTrain = trains.find((t) => t.number === selectedTrainForEdit) || trains[0];
    const prevPlatform = targetTrain.platform || '4';

    // Update in local state
    setTrains((prev) =>
      prev.map((t) =>
        t.number === selectedTrainForEdit ? { ...t, platform: newPlatformNumber } : t
      )
    );

    // Emit live event across entire application
    railwayEvents.emit({
      id: `evt-${Date.now()}`,
      type: 'PLATFORM_CHANGED',
      trainNumber: targetTrain.number,
      trainName: targetTrain.name,
      originalPlatform: prevPlatform,
      newPlatform: newPlatformNumber,
      message: `ALERT: Train ${targetTrain.number} (${targetTrain.name}) platform changed from Platform ${prevPlatform} to Platform ${newPlatformNumber} at ${currentStation.name}.`,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'WARNING',
    });

    setStatusFeedback(
      `Dispatched Platform Change: Train #${targetTrain.number} reassigned to Platform ${newPlatformNumber}. Alert sent to all commuters!`
    );
    addAuditLog(`Reassigned Train #${targetTrain.number} to Platform ${newPlatformNumber}`);
    setTimeout(() => setStatusFeedback(null), 6000);
  };

  const handleBroadcastAlert = () => {
    if (!broadcastMessage.trim()) return;

    railwayEvents.emit({
      id: `evt-alert-${Date.now()}`,
      type: 'STATION_ALERT',
      message: `OFFICIAL SOUTHERN RAILWAY NOTICE: ${broadcastMessage.trim()}`,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'CRITICAL',
    });

    setStatusFeedback(`Broadcast sent to all commuter displays: "${broadcastMessage}"`);
    addAuditLog(`Broadcasted notice: "${broadcastMessage}"`);
    setBroadcastMessage('');
    setTimeout(() => setStatusFeedback(null), 6000);
  };

  // RESTRICTED ACCESS SCREEN (If not unlocked / not owner)
  if (!isAdminUnlocked && !isOwnerEmail) {
    return (
      <div className="min-h-screen bg-[#070707] text-white pt-24 pb-32 font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#121212] border-2 border-rose-500/60 p-8 shadow-2xl relative">
          <div className="flex items-center gap-3 text-rose-500 mb-4">
            <span className="material-symbols-outlined text-[32px]">security</span>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                RESTRICTED ACCESS
              </div>
              <h2 className="text-xl font-display font-black uppercase text-white">
                Admin Clearance Required
              </h2>
            </div>
          </div>

          <p className="text-xs font-mono text-white/70 mb-6 leading-relaxed">
            This administrative operations console is strictly restricted to the site owner{' '}
            <strong className="text-[#ff3e00]">indreshgovindarasu08@gmail.com</strong>. Commuters do not have permission to view backend operations.
          </p>

          {adminAuthError && (
            <div className="p-3 bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs font-mono mb-4">
              {adminAuthError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                Enter Admin Master Key or Owner Email:
              </label>
              <input
                type="password"
                value={passcodeAttempt}
                onChange={(e) => setPasscodeAttempt(e.target.value)}
                placeholder="Enter admin passcode"
                className="w-full bg-black border border-white/20 text-white p-2.5 text-sm font-mono focus:border-[#ff3e00] outline-none"
                required
              />
              <span className="text-[10px] font-mono text-white/40 mt-1 block">
                Default Master Key: <code className="text-emerald-400">admin123</code> or login with <code className="text-emerald-400">{ADMIN_EMAIL}</code>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('explore')}
                className="px-4 py-2 border border-white/20 text-xs font-mono uppercase text-white/70 hover:text-white cursor-pointer"
              >
                ← Return to Home
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-mono uppercase font-black tracking-wider cursor-pointer shadow-lg"
              >
                Verify & Unlock Admin Console
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = userList.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phoneNumber.includes(q) ||
      u.station.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-20 pb-32 font-sans selection:bg-[#ff3e00] selection:text-white">
      {/* Admin Top Command Header */}
      <div className="bg-[#121212] border-b-2 border-[#ff3e00] px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff3e00] text-black font-mono font-black text-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/40 uppercase tracking-widest">
                  ADMIN RESTRICTED CONSOLE
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE OPERATIONAL
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-display font-black text-white uppercase tracking-tight">
                Southern Railway Master Control Center
              </h1>
              <div className="text-xs font-mono text-white/50">
                Administrator: <strong className="text-[#00f0ff]">{ADMIN_EMAIL}</strong> &bull; Southern Zone Hubs
              </div>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('user')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black border border-white/20 text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer"
            >
              View User Page &rarr;
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="px-3 py-1.5 bg-[#ff3e00]/10 hover:bg-[#ff3e00]/20 text-[#ff3e00] border border-[#ff3e00]/40 text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer"
            >
              Public Home &rarr;
            </button>
            <button
              onClick={() => {
                setIsAdminUnlocked(false);
                onUpdateUserPrefs({ role: 'user' });
                onNavigate('explore');
              }}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-mono uppercase font-bold tracking-wider cursor-pointer"
            >
              Exit Admin
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Status Toast Banner */}
        {statusFeedback && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
              <span>{statusFeedback}</span>
            </div>
            <button
              onClick={() => setStatusFeedback(null)}
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Admin KPI Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-white/15 p-4">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              REGISTERED COMMUTERS
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
              {userList.length}
            </div>
            <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
              &bull; 100% Mobile &amp; Email Verified
            </div>
          </div>

          <div className="bg-[#121212] border border-white/15 p-4">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              TAMIL NADU EXPRESSES
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#ff3e00] mt-1">
              52 TRAINS
            </div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">
              Including CBE &rarr; Tuticorin #16612
            </div>
          </div>

          <div className="bg-[#121212] border border-white/15 p-4">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              ACTIVE STATIONS MESH
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#00f0ff] mt-1">
              15 HUBS
            </div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">
              CBE, TN, MAS, MS, MDU, TPJ, SA
            </div>
          </div>

          <div className="bg-[#121212] border border-white/15 p-4">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              PLATFORM DISPATCH STATE
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400 mt-1">
              NORMAL
            </div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">
              Auto telemetry streaming active
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-white/15 overflow-x-auto text-xs font-mono font-bold uppercase tracking-wider">
          <button
            onClick={() => setAdminTab('users')}
            className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              adminTab === 'users'
                ? 'border-[#ff3e00] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>Registered Users Directory ({userList.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('dispatcher')}
            className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              adminTab === 'dispatcher'
                ? 'border-[#ff3e00] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">settings_input_antenna</span>
            <span>Live Train Dispatcher &amp; Alerts</span>
          </button>
          <button
            onClick={() => setAdminTab('telemetry')}
            className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              adminTab === 'telemetry'
                ? 'border-[#ff3e00] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Station 3D Twin Telemetry</span>
          </button>
          <button
            onClick={() => setAdminTab('audit')}
            className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              adminTab === 'audit'
                ? 'border-[#ff3e00] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>Audit &amp; Security Logs</span>
          </button>
        </div>

        {/* TAB 1: REGISTERED USERS DIRECTORY */}
        {adminTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#101010] p-4 border border-white/15">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search registered user by name, email, mobile..."
                  className="w-full bg-black border border-white/20 text-white text-xs font-mono py-2 pl-9 pr-3 outline-none focus:border-[#ff3e00]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewUserModalOpen(true)}
                  className="px-3.5 py-2 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-mono uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Register Commuter</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white hover:text-black border border-white/20 text-white text-xs font-mono uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#101010] border border-white/15 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/15 bg-black/50 text-white/60 uppercase">
                    <th className="p-3">Commuter Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Mobile Number</th>
                    <th className="p-3">Primary Station</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Registered</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#ff3e00]/20 text-[#ff3e00] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>{u.name}</span>
                      </td>
                      <td className="p-3 text-white/80">{u.email}</td>
                      <td className="p-3 text-[#00f0ff] font-bold">+91 {u.phoneNumber}</td>
                      <td className="p-3 text-white/60">{u.station}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-white/40 text-[11px]">{u.registeredAt}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="px-2 py-1 bg-white/10 hover:bg-white hover:text-black text-[10px] uppercase cursor-pointer"
                          title="Toggle Active/Suspended"
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        {u.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 text-[10px] uppercase cursor-pointer"
                            title="Delete User"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-xs font-mono text-white/40">
                  No registered users match the search criteria.
                </div>
              )}
            </div>

            {/* Modal to Register a User by Admin */}
            {newUserModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#121212] border border-white/20 p-6 max-w-md w-full">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <h3 className="font-display font-black text-lg uppercase text-white">
                      Admin: Register New Commuter
                    </h3>
                    <button
                      onClick={() => setNewUserModalOpen(false)}
                      className="text-white/60 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Senthil Kumar"
                        className="w-full bg-black border border-white/20 text-white p-2.5 text-sm font-sans focus:border-[#ff3e00] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="senthil@gmail.com"
                        className="w-full bg-black border border-white/20 text-white p-2.5 text-sm font-mono focus:border-[#ff3e00] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1">10-Digit Mobile Number</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full bg-black border border-white/20 text-white p-2.5 text-sm font-mono focus:border-[#ff3e00] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1">Home Station Hub</label>
                      <select
                        value={newUserStation}
                        onChange={(e) => setNewUserStation(e.target.value)}
                        className="w-full bg-black border border-white/20 text-white p-2.5 text-sm font-mono focus:border-[#ff3e00] outline-none"
                      >
                        <option value="Coimbatore Junction (CBE)">Coimbatore Junction (CBE)</option>
                        <option value="Tuticorin / Thoothukudi (TN)">Tuticorin / Thoothukudi (TN)</option>
                        <option value="Chennai Central (MAS)">Chennai Central (MAS)</option>
                        <option value="Madurai Jn (MDU)">Madurai Jn (MDU)</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setNewUserModalOpen(false)}
                        className="px-4 py-2 border border-white/20 text-xs font-mono uppercase text-white/70 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#ff3e00] text-white text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#e03700] cursor-pointer"
                      >
                        Create Commuter Record
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE TRAIN DISPATCHER & BROADCAST ALERTS */}
        {adminTab === 'dispatcher' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live Platform Re-assigner */}
            <div className="lg:col-span-6 bg-[#101010] border border-white/15 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="material-symbols-outlined text-[#ff3e00] text-[20px]">swap_horiz</span>
                <h3 className="font-display font-black text-sm uppercase text-white">
                  Live Platform Re-assignment Controller
                </h3>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                  Select Active Train:
                </label>
                <select
                  value={selectedTrainForEdit}
                  onChange={(e) => setSelectedTrainForEdit(e.target.value)}
                  className="w-full bg-black border border-white/20 text-white p-2.5 text-sm font-mono focus:border-[#ff3e00] outline-none"
                >
                  <option value="16612">#16612 - Coimbatore &rarr; Tuticorin Link Express</option>
                  <option value="16611">#16611 - Tuticorin &rarr; Coimbatore Link Express</option>
                  <option value="12681">#12681 - Chennai Central &rarr; Coimbatore Superfast</option>
                  <option value="20644">#20644 - Coimbatore &rarr; Chennai Vande Bharat</option>
                  <option value="12693">#12693 - Chennai Egmore &rarr; Tuticorin Pearl City</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                  New Platform Target:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['1', '2', '3', '4', '5', '6'].map((pf) => (
                    <button
                      key={pf}
                      type="button"
                      onClick={() => setNewPlatformNumber(pf)}
                      className={`py-2 text-xs font-mono font-bold cursor-pointer border ${
                        newPlatformNumber === pf
                          ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                          : 'bg-black text-white/70 border-white/20 hover:text-white'
                      }`}
                    >
                      PF {pf}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDispatchPlatformChange}
                className="w-full py-3 bg-[#ff3e00] hover:bg-[#e03700] text-white font-mono font-black uppercase text-xs tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">publish</span>
                <span>Dispatch Platform Change &amp; Alert Commuters</span>
              </button>
            </div>

            {/* Right Column: Station Alert Broadcaster */}
            <div className="lg:col-span-6 bg-[#101010] border border-white/15 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="material-symbols-outlined text-amber-400 text-[20px]">campaign</span>
                <h3 className="font-display font-black text-sm uppercase text-white">
                  Broadcast Realtime Station Notice
                </h3>
              </div>

              <p className="text-xs font-mono text-white/50 leading-relaxed">
                Broadcasts an official high-priority alert across all commuter screens, audio feeds, and 3D station twin overlays.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                  Alert Message:
                </label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Coimbatore Platform 4 FOB lift under maintenance. Wheelchair commuters please use Platform 1 ramp."
                  className="w-full bg-black border border-white/20 text-white p-2.5 text-xs font-mono focus:border-amber-400 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() =>
                    setBroadcastMessage(
                      'Coimbatore Platform 4 FOB lift under scheduled inspection. Wheelchair commuters please use Platform 1 ramp.'
                    )
                  }
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 cursor-pointer"
                >
                  Lift Notice Template
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBroadcastMessage(
                      'Train #16612 Coimbatore-Tuticorin Link Express boarding commenced at Platform 4.'
                    )
                  }
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 cursor-pointer"
                >
                  Tuticorin Boarding Template
                </button>
              </div>

              <button
                onClick={handleBroadcastAlert}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black uppercase text-xs tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span>Broadcast Alert to All Users</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: STATION 3D TWIN TELEMETRY */}
        {adminTab === 'telemetry' && (
          <div className="bg-[#101010] border border-white/15 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-black text-sm uppercase text-white">
                Tamil Nadu Station Spatial Mesh Telemetry
              </h3>
              <span className="text-[10px] font-mono text-[#00f0ff]">
                All 15 Station Twins Synchronized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { code: 'CBE', name: 'Coimbatore Junction', platforms: 6, beacons: 42, status: 'ONLINE' },
                { code: 'TN', name: 'Tuticorin (Thoothukudi)', platforms: 3, beacons: 28, status: 'ONLINE' },
                { code: 'MAS', name: 'Chennai Central', platforms: 17, beacons: 88, status: 'ONLINE' },
                { code: 'MS', name: 'Chennai Egmore', platforms: 11, beacons: 64, status: 'ONLINE' },
                { code: 'MDU', name: 'Madurai Junction', platforms: 8, beacons: 52, status: 'ONLINE' },
                { code: 'TPJ', name: 'Tiruchirappalli Junction', platforms: 8, beacons: 48, status: 'ONLINE' },
              ].map((st) => (
                <div key={st.code} className="p-4 bg-black border border-white/15 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-[#ff3e00]">{st.code}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 border border-emerald-500/40">
                        {st.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{st.name}</div>
                    <div className="text-[11px] font-mono text-white/50 mt-1">
                      {st.platforms} Platforms &bull; {st.beacons} Spatial Anchors
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">LiDAR Mesh v3.4</span>
                    <button
                      onClick={() => onNavigate('map')}
                      className="text-[#00f0ff] hover:underline cursor-pointer"
                    >
                      Inspect Twin &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {adminTab === 'audit' && (
          <div className="bg-[#101010] border border-white/15 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-black text-sm uppercase text-white">
                Administrative Audit Trail &amp; Event Logs
              </h3>
              <button
                onClick={() => addAuditLog('Manual log checkpoint verified')}
                className="text-[10px] font-mono text-white/60 hover:text-white cursor-pointer"
              >
                + Checkpoint
              </button>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-black border border-white/10 flex items-center justify-between gap-4 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/40">{log.time}</span>
                    <span className="text-white font-bold">{log.action}</span>
                  </div>
                  <span className="text-[#00f0ff] text-[11px] shrink-0">{log.user}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
