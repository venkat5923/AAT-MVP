import React from 'react';
import { ScreenType, Language, Persona } from '../types';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  lang: Language;
  onToggleLang: () => void;
  persona: Persona;
  onChangePersona: (p: Persona) => void;
  farmerName: string;
  farmerPhone: string;
  selectedDistrict: string;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  lang,
  onToggleLang,
  persona,
  onChangePersona,
  farmerName,
  farmerPhone,
  selectedDistrict,
}) => {
  if (!isOpen) return null;

  const navigateAndClose = (screen: ScreenType) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer-container" onClick={e => e.stopPropagation()}>
        {/* User Card */}
        <div className="drawer-header">
          <div className="drawer-avatar">👨‍🌾</div>
          <div className="drawer-user-info">
            <h3 className="drawer-user-name">{farmerName}</h3>
            <p className="drawer-user-phone">{farmerPhone}</p>
            <span className="drawer-location-badge">📍 {selectedDistrict}</span>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close Drawer">
            ✕
          </button>
        </div>

        {/* Quick Language & Mode Switcher */}
        <div className="drawer-quick-controls">
          <div className="control-row">
            <span className="control-label">{lang === 'te' ? 'భాష / Language' : 'Language'}</span>
            <button
              type="button"
              className="lang-toggle-btn"
              onClick={onToggleLang}
            >
              {lang === 'te' ? '🇮🇳 తెలుగు (Active) ⇄ EN' : '🇬🇧 English (Active) ⇄ తెలుగు'}
            </button>
          </div>

          <div className="control-row">
            <span className="control-label">{lang === 'te' ? 'పాత్ర / Role' : 'Role'}</span>
            <select
              value={persona}
              onChange={e => onChangePersona(e.target.value as Persona)}
              className="persona-select-dropdown"
            >
              <option value="farmer">🌾 {lang === 'te' ? 'రైతు (భాను కాప)' : 'Farmer (Bhanu Kapa)'}</option>
              <option value="provider_tractor">🚜 {lang === 'te' ? 'ట్రాక్టర్ ఓనర్ (కాప నాని)' : 'Provider (Kapa Nani)'}</option>
              <option value="provider_drone">🚁 {lang === 'te' ? 'డ్రోన్ ఆపరేటర్ (భాను నాయుడు)' : 'Provider (Bhanu Naidu)'}</option>
              <option value="admin">🏢 {lang === 'te' ? 'నెల్లూరు అడ్మిన్ డ్యాష్‌బోర్డ్' : 'Nellore Ops Reviewer'}</option>
            </select>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="drawer-nav-list">
          <div className="drawer-nav-section-title">
            {lang === 'te' ? 'సేవా విభాగాలు' : 'Main Services'}
          </div>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'home' ? 'active' : ''}`}
            onClick={() => navigateAndClose('home')}
          >
            <span className="nav-item-icon">🏠</span>
            <span className="nav-item-text">{lang === 'te' ? 'హోమ్ డ్యాష్‌బోర్డ్' : 'Home Dashboard'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'crop_selection' || currentScreen === 'service_selection' ? 'active' : ''}`}
            onClick={() => navigateAndClose('crop_selection')}
          >
            <span className="nav-item-icon">🌱</span>
            <span className="nav-item-text">{lang === 'te' ? 'పంట & సేవ బుకింగ్ ఫ్లో' : 'Crop & Service Booking Flow'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'tractor' ? 'active' : ''}`}
            onClick={() => navigateAndClose('tractor')}
          >
            <span className="nav-item-icon">🚜</span>
            <span className="nav-item-text">{lang === 'te' ? 'ట్రాక్టర్ల అద్దె' : 'Tractor Booking'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'drone' ? 'active' : ''}`}
            onClick={() => navigateAndClose('drone')}
          >
            <span className="nav-item-icon">🚁</span>
            <span className="nav-item-text">{lang === 'te' ? 'డ్రోన్ సర్వీసులు' : 'Drone Services'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'machines' ? 'active' : ''}`}
            onClick={() => navigateAndClose('machines')}
          >
            <span className="nav-item-icon">⚙️</span>
            <span className="nav-item-text">{lang === 'te' ? 'వ్యవసాయ యంత్రాలు' : 'Farm Machines'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'drip' ? 'active' : ''}`}
            onClick={() => navigateAndClose('drip')}
          >
            <span className="nav-item-icon">💧</span>
            <span className="nav-item-text">{lang === 'te' ? 'డ్రిప్ ఇరిగేషన్' : 'Drip Irrigation'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'store' ? 'active' : ''}`}
            onClick={() => navigateAndClose('store')}
          >
            <span className="nav-item-icon">🛒</span>
            <span className="nav-item-text">{lang === 'te' ? 'అగ్రి స్టోర్ (విత్తనాలు, ఎరువులు)' : 'Agri Store (Seeds & Fert)'}</span>
          </button>

          <div className="drawer-nav-section-title">
            {lang === 'te' ? 'ఖాతా & బుకింగ్స్' : 'Account & Orders'}
          </div>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'bookings' ? 'active' : ''}`}
            onClick={() => navigateAndClose('bookings')}
          >
            <span className="nav-item-icon">📋</span>
            <span className="nav-item-text">{lang === 'te' ? 'నా బుకింగ్స్' : 'My Bookings'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'tracking' ? 'active' : ''}`}
            onClick={() => navigateAndClose('tracking')}
          >
            <span className="nav-item-icon">📍</span>
            <span className="nav-item-text">{lang === 'te' ? 'లైవ్ ట్రాకింగ్ మ్యాప్' : 'Live Tracking Map'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'wallet' ? 'active' : ''}`}
            onClick={() => navigateAndClose('wallet')}
          >
            <span className="nav-item-icon">👛</span>
            <span className="nav-item-text">{lang === 'te' ? 'నా వాలెట్ & లావాదేవీలు' : 'My Wallet & Transactions'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'support' ? 'active' : ''}`}
            onClick={() => navigateAndClose('support')}
          >
            <span className="nav-item-icon">🎧</span>
            <span className="nav-item-text">{lang === 'te' ? 'వ్యవసాయ నిపుణుల సలహాలు' : 'Expert Agri Support'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'provider' ? 'active' : ''}`}
            onClick={() => navigateAndClose('provider')}
          >
            <span className="nav-item-icon">💼</span>
            <span className="nav-item-text">{lang === 'te' ? 'పార్టనర్ పోర్టల్ (ఆపరేటర్)' : 'Provider Partner Portal'}</span>
          </button>

          <button
            type="button"
            className={`drawer-nav-item ${currentScreen === 'admin' ? 'active' : ''}`}
            onClick={() => navigateAndClose('admin')}
          >
            <span className="nav-item-icon">📊</span>
            <span className="nav-item-text">{lang === 'te' ? 'అడ్మిన్ డ్యాష్‌బోర్డ్' : 'Admin Operations Hub'}</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="drawer-footer">
          <p className="drawer-footer-text">Akanksha Agree Tech (AAT)</p>
          <p className="drawer-footer-sub">Operating in 61 AP & TG Reference Districts</p>
          <a href="tel:18001801551" className="drawer-helpline-btn">
            📞 Kisan Helpline: 1800-180-1551
          </a>
        </div>
      </aside>
    </div>
  );
};
