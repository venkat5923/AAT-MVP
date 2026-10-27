import React, { useState, useEffect } from 'react';
import { ScreenType, Language, Persona } from '../types';

interface MobileFrameProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  lang: Language;
  onToggleLang: () => void;
  persona: Persona;
  onChangePersona: (p: Persona) => void;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  currentScreen,
  onNavigate,
  lang,
  onToggleLang,
  persona,
  onChangePersona,
  children,
}) => {
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('10:20');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const screenOptions: { id: ScreenType; label: string; group: string }[] = [
    { id: 'home', label: '1. 🏠 Home Dashboard (Image 1 & 2 Frame 1)', group: 'Farmer' },
    { id: 'drip', label: '2. 💧 Drip Irrigation (Image 1 Frame 2)', group: 'Farmer' },
    { id: 'drone', label: '3. 🚁 Drone Services (Image 1 Frame 3)', group: 'Farmer' },
    { id: 'tractor', label: '4. 🚜 Tractor Booking (Image 1 Frame 4)', group: 'Farmer' },
    { id: 'machines', label: '5. 🌾 Farm Machines (Image 1 Frame 5)', group: 'Farmer' },
    { id: 'crop_selection', label: '6. 🌱 Crop Selection - పంట ఎంపిక (Image 2 Frame 2)', group: 'Booking Flow' },
    { id: 'service_selection', label: '7. ⚙️ Service Selection - సేవ ఎంపిక (Image 2 Frame 3)', group: 'Booking Flow' },
    { id: 'booking_summary', label: '8. 📋 Booking Summary - బుకింగ్ సమ్మరీ (Image 2 Frame 4)', group: 'Booking Flow' },
    { id: 'payment', label: '9. 💳 Payment - చెల్లింపు (Image 2 Frame 5)', group: 'Booking Flow' },
    { id: 'tracking', label: '10. 📍 Live Tracking - లైవ్ ట్రాకింగ్ (Image 2 Frame 6)', group: 'Booking Flow' },
    { id: 'bookings', label: '11. 📅 My Bookings - నా బుకింగ్స్ (Image 1 & 2 Frame 7)', group: 'Farmer' },
    { id: 'store', label: '12. 🛒 Agri Store & Cart (Image 1 Frame 7)', group: 'Farmer' },
    { id: 'support', label: '13. 🎧 Expert Support (Image 1 Frame 8)', group: 'Farmer' },
    { id: 'wallet', label: '14. 👛 Wallet & Top-up (Image 1 Frame 9)', group: 'Farmer' },
    { id: 'profile', label: '15. 👤 Profile (Image 1 & 2 Frame 8)', group: 'Farmer' },
    { id: 'provider', label: '16. 🚜 Provider App (Image 2 Frames 9 & 10)', group: 'Provider' },
    { id: 'admin', label: '17. 📊 Admin Dashboard (Image 2 Frame 11)', group: 'Admin' },
  ];

  return (
    <div className={`app-workspace-wrapper ${isPhoneFrameMode ? 'frame-mode' : 'full-mode'}`}>
      {/* Top Device Control Panel */}
      <header className="device-control-panel">
        <div className="panel-left-group">
          <div className="platform-tag">
            <span className="dot-active" />
            <strong>Akanksha Agree Tech (AAT) Mobile MVP</strong>
          </div>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${isPhoneFrameMode ? 'active' : ''}`}
              onClick={() => setIsPhoneFrameMode(true)}
              title="Preview in Mobile Phone Shell"
            >
              📱 Phone Frame
            </button>
            <button
              type="button"
              className={`mode-btn ${!isPhoneFrameMode ? 'active' : ''}`}
              onClick={() => setIsPhoneFrameMode(false)}
              title="Full Width Mobile Responsive View"
            >
              🖥️ Full Screen
            </button>
          </div>
        </div>

        <div className="panel-right-group">
          {/* Quick Jump Dropdown */}
          <div className="quick-jump-wrapper">
            <span className="dropdown-label">Quick Jump:</span>
            <select
              value={currentScreen}
              onChange={e => onNavigate(e.target.value as ScreenType)}
              className="quick-jump-select"
            >
              {screenOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Switcher */}
          <button
            type="button"
            className="panel-lang-btn"
            onClick={onToggleLang}
            title="Toggle between English and Telugu"
          >
            {lang === 'te' ? '🇮🇳 తెలుగు (Active)' : '🇬🇧 English (Active)'}
          </button>

          {/* Persona Switcher */}
          <select
            value={persona}
            onChange={e => onChangePersona(e.target.value as Persona)}
            className="panel-persona-select"
          >
            <option value="farmer">🌾 Bhanu Kapa (Farmer)</option>
            <option value="provider_tractor">🚜 Kapa Nani (Tractor Owner)</option>
            <option value="provider_drone">🚁 Bhanu Naidu (Drone Pilot)</option>
            <option value="admin">📊 Nellore Ops Admin</option>
          </select>
        </div>
      </header>

      {/* Mobile Device Frame Body */}
      <main className="mobile-shell-stage">
        <div className="mobile-device-chassis">
          {/* Hardware Punch Hole Camera & Speaker */}
          <div className="chassis-speaker-slit" />
          <div className="chassis-camera-hole" />

          {/* Mobile Status Bar (9:41 / 10:20, Signal, Battery) */}
          <div className="mobile-status-bar">
            <div className="status-bar-time">{currentTime}</div>
            <div className="status-bar-icons">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
              <span className="status-bar-signal">5G</span>
              <svg width="18" height="12" viewBox="0 0 24 14" fill="currentColor">
                <rect x="1" y="1" width="18" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="3" width="13" height="8" rx="1.5" />
                <rect x="20" y="4" width="2" height="6" rx="1" />
              </svg>
            </div>
          </div>

          {/* Inner App Canvas */}
          <div className="mobile-screen-viewport">
            {children}
          </div>

          {/* Mobile Home Swipe Bar */}
          <div className="mobile-home-indicator-bar" />
        </div>
      </main>
    </div>
  );
};
