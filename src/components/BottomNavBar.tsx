import React from 'react';
import { TabType, UserPreferences } from '../types';

interface BottomNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentUser?: UserPreferences;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onTabChange, currentUser }) => {
  const isAdmin = currentUser?.email?.toLowerCase() === 'indreshgovindarasu08@gmail.com' || currentUser?.role === 'admin';

  const tabs = [
    {
      id: 'explore' as TabType,
      label: 'Home',
      icon: 'home',
      match: ['explore'],
    },
    {
      id: 'train_search' as TabType,
      label: 'Trains',
      icon: 'train',
      match: ['train_search', 'train_details'],
    },
    {
      id: 'map' as TabType,
      label: '3D Station',
      icon: 'map',
      match: ['map'],
    },
    {
      id: 'user' as TabType,
      label: 'User Page',
      icon: 'badge',
      match: ['user'],
    },
    {
      id: 'assistant' as TabType,
      label: 'AI Pilot',
      icon: 'smart_toy',
      match: ['assistant'],
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as TabType,
            label: 'Admin',
            icon: 'shield_person',
            match: ['admin'],
          },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-[#0a0a0a] border-t border-white/15 shadow-2xl flex justify-around items-center h-16 pb-safe px-1 sm:px-6">
      {tabs.map((tab) => {
        const isActive = tab.match.includes(currentTab);

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 px-2.5 py-1 ${
              isActive
                ? 'bg-white text-black font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            aria-label={tab.label}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 700" : "'FILL' 0, 'wght' 400" }}
            >
              {tab.icon}
            </span>
            <span className={`text-[9px] uppercase tracking-wider mt-0.5 ${isActive ? 'font-black' : 'font-semibold'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
