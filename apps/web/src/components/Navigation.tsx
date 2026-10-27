import React from 'react';
import { ScreenType, Language } from '../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  lang: Language;
  cartCount: number;
  unreadNotifications: number;
  onOpenDrawer: () => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
}

export const TopAppBar: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  lang,
  cartCount,
  unreadNotifications,
  onOpenDrawer,
  onOpenCart,
  onOpenNotifications,
}) => {
  const isHome = currentScreen === 'home';

  const getTitle = () => {
    switch (currentScreen) {
      case 'home':
        return lang === 'te' ? 'ఆకాంక్ష అగ్రి టెక్' : 'Akanksha Agree Tech';
      case 'drip':
        return lang === 'te' ? 'డ్రిప్ ఇరిగేషన్' : 'Drip Irrigation';
      case 'drone':
        return lang === 'te' ? 'డ్రోన్ సేవలు' : 'Drone Services';
      case 'tractor':
        return lang === 'te' ? 'ట్రాక్టర్ బుకింగ్' : 'Tractor Booking';
      case 'machines':
        return lang === 'te' ? 'వ్యవసాయ యంత్రాలు' : 'Farm Machines';
      case 'crop_selection':
        return lang === 'te' ? 'పంట ఎంపిక' : 'Crop Selection';
      case 'service_selection':
        return lang === 'te' ? 'సేవ ఎంపిక' : 'Service Selection';
      case 'booking_summary':
        return lang === 'te' ? 'బుకింగ్ సమ్మరీ' : 'Booking Summary';
      case 'payment':
        return lang === 'te' ? 'చెల్లింపు' : 'Payment';
      case 'tracking':
        return lang === 'te' ? 'లైవ్ ట్రాకింగ్' : 'Live Tracking';
      case 'bookings':
        return lang === 'te' ? 'నా బుకింగ్స్' : 'Bookings';
      case 'store':
        return lang === 'te' ? 'అగ్రి స్టోర్' : 'Agri Store';
      case 'support':
        return lang === 'te' ? 'వ్యవసాయ నిపుణులు' : 'Expert Support';
      case 'wallet':
        return lang === 'te' ? 'వాలెట్' : 'Wallet';
      case 'profile':
        return lang === 'te' ? 'ప్రొఫైల్' : 'Profile';
      case 'provider':
        return lang === 'te' ? 'పార్టనర్ ఆర్డర్లు' : 'Provider App';
      case 'admin':
        return lang === 'te' ? 'అడ్మిన్ డ్యాష్‌బోర్డ్' : 'Admin Dashboard';
      default:
        return 'Akanksha Agree Tech';
    }
  };

  return (
    <header className="mobile-top-bar">
      <div className="mobile-top-bar-left">
        {isHome ? (
          <button
            type="button"
            className="icon-btn-touch"
            onClick={onOpenDrawer}
            aria-label="Open Navigation Menu"
            title="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            className="icon-btn-touch back-btn"
            onClick={() => onNavigate('home')}
            aria-label="Back to Home"
            title="Back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className="mobile-brand-title">
          <span className="brand-leaf-icon">🌱</span>
          <h1 className="topbar-title-text">{getTitle()}</h1>
        </div>
      </div>

      <div className="mobile-top-bar-right">
        {/* Notifications Icon */}
        <button
          type="button"
          className="icon-btn-touch"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          title="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadNotifications > 0 && <span className="badge-dot" />}
        </button>

        {/* Cart Icon */}
        <button
          type="button"
          className="icon-btn-touch cart-btn"
          onClick={onOpenCart}
          aria-label="Shopping Cart"
          title="Shopping Cart"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
};

export const BottomTabBar: React.FC<{
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  lang: Language;
  bookingCount: number;
}> = ({ currentScreen, onNavigate, lang, bookingCount }) => {
  const tabs = [
    {
      id: 'home' as ScreenType,
      label: lang === 'te' ? 'హోమ్' : 'Home',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'bookings' as ScreenType,
      label: lang === 'te' ? 'నా బుకింగ్స్' : 'Bookings',
      badge: bookingCount,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'store' as ScreenType,
      label: lang === 'te' ? 'ఆర్డర్లు' : 'Orders',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'wallet' as ScreenType,
      label: lang === 'te' ? 'వాలెట్' : 'Wallet',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
    {
      id: 'profile' as ScreenType,
      label: lang === 'te' ? 'ప్రొఫైల్' : 'Profile',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map(tab => {
        const isActive = currentScreen === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`bottom-tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(tab.id)}
          >
            <div className="tab-icon-wrapper">
              {tab.icon}
              {tab.badge && tab.badge > 0 ? (
                <span className="tab-badge">{tab.badge}</span>
              ) : null}
            </div>
            <span className="tab-label-text">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
