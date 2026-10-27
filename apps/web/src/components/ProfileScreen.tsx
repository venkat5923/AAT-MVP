import React, { useState } from 'react';
import { Language, ScreenType, Persona } from '../types';

interface ProfileScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  farmerName: string;
  farmerPhone: string;
  selectedDistrict: string;
  persona: Persona;
  onChangePersona: (p: Persona) => void;
  onToggleLang: () => void;
  onShowToast: (msg: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  lang,
  onNavigate,
  farmerName,
  farmerPhone,
  selectedDistrict,
  persona: _persona,
  onChangePersona,
  onToggleLang,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

  return (
    <div className="screen-content profile-screen">
      {/* Profile Header Card (Image 1 Frame 10 & Image 2 Frame 8) */}
      <div className="profile-header-card">
        <div className="profile-avatar-circle">
          <span>👨‍🌾</span>
          <span className="profile-verified-badge">✓</span>
        </div>
        <div className="profile-user-meta">
          <h3 className="profile-user-name">{farmerName}</h3>
          <p className="profile-phone-number">{farmerPhone}</p>
          <span className="profile-location-chip">📍 {selectedDistrict}</span>
        </div>
      </div>

      {/* Main Options List (Image 1 Frame 10 & Image 2 Frame 8) */}
      <div className="profile-menu-container">
        {/* 1. My Bookings */}
        <div
          className="profile-menu-row"
          onClick={() => onNavigate('bookings')}
        >
          <div className="menu-left">
            <span className="menu-icon">📋</span>
            <span className="menu-title">{isTe ? 'నా బుకింగ్స్' : 'My Bookings'}</span>
          </div>
          <span className="menu-chevron">›</span>
        </div>

        {/* 2. My Orders */}
        <div
          className="profile-menu-row"
          onClick={() => onNavigate('store')}
        >
          <div className="menu-left">
            <span className="menu-icon">📦</span>
            <span className="menu-title">{isTe ? 'నా ఆర్డర్లు' : 'My Orders'}</span>
          </div>
          <span className="menu-chevron">›</span>
        </div>

        {/* 3. My Wallet */}
        <div
          className="profile-menu-row"
          onClick={() => onNavigate('wallet')}
        >
          <div className="menu-left">
            <span className="menu-icon">👛</span>
            <span className="menu-title">{isTe ? 'నా వాలెట్' : 'My Wallet'}</span>
          </div>
          <span className="menu-chevron">›</span>
        </div>

        {/* 4. My Addresses */}
        <div
          className="profile-menu-row"
          onClick={() => setShowAddressModal(true)}
        >
          <div className="menu-left">
            <span className="menu-icon">🏡</span>
            <span className="menu-title">{isTe ? 'నా పొలం చిరునామాలు' : 'My Addresses & Farm Parcels'}</span>
          </div>
          <span className="menu-chevron">›</span>
        </div>

        {/* 5. Payment Methods */}
        <div
          className="profile-menu-row"
          onClick={() => onNavigate('payment')}
        >
          <div className="menu-left">
            <span className="menu-icon">💳</span>
            <span className="menu-title">{isTe ? 'చెల్లింపు విధానాలు' : 'Payment Methods'}</span>
          </div>
          <span className="menu-chevron">›</span>
        </div>

        {/* 6. Language Settings */}
        <div
          className="profile-menu-row"
          onClick={onToggleLang}
        >
          <div className="menu-left">
            <span className="menu-icon">🌐</span>
            <span className="menu-title">{isTe ? 'భాష: తెలుగు (మార్చండి)' : 'Language: English (Switch)'}</span>
          </div>
          <span className="language-badge">{isTe ? 'తెలుగు' : 'English'}</span>
        </div>

        {/* 7. Help & Support */}
        <div
          className="profile-menu-row"
          onClick={() => onNavigate('support')}
        >
          <div className="menu-left">
            <span className="menu-icon">🎧</span>
            <span className="menu-title">{isTe ? 'సహాయం & మద్దతు' : 'Help & Support'}</span>
          </div>
          <span className="menu-chevron">›</span>
        </div>

        {/* 8. Switch to Provider App */}
        <div
          className="profile-menu-row special-mode-row"
          onClick={() => {
            onChangePersona('provider_tractor');
            onNavigate('provider');
          }}
        >
          <div className="menu-left">
            <span className="menu-icon">🚜</span>
            <span className="menu-title">{isTe ? 'ట్రాక్టర్ ఓనర్ మోడ్ (పార్టనర్)' : 'Switch to Provider App (Tractor)'}</span>
          </div>
          <span className="mode-switch-tag">Switch ›</span>
        </div>

        {/* 9. Switch to Drone Operator */}
        <div
          className="profile-menu-row special-mode-row"
          onClick={() => {
            onChangePersona('provider_drone');
            onNavigate('provider');
          }}
        >
          <div className="menu-left">
            <span className="menu-icon">🚁</span>
            <span className="menu-title">{isTe ? 'డ్రోన్ ఆపరేటర్ మోడ్' : 'Switch to Drone Operator App'}</span>
          </div>
          <span className="mode-switch-tag">Switch ›</span>
        </div>

        {/* 10. Admin Operations Dashboard */}
        <div
          className="profile-menu-row special-mode-row"
          onClick={() => {
            onChangePersona('admin');
            onNavigate('admin');
          }}
        >
          <div className="menu-left">
            <span className="menu-icon">📊</span>
            <span className="menu-title">{isTe ? 'అడ్మిన్ డ్యాష్‌బోర్డ్' : 'Operations Admin Dashboard'}</span>
          </div>
          <span className="mode-switch-tag">View ›</span>
        </div>

        {/* 11. Logout */}
        <div
          className="profile-menu-row logout-row"
          onClick={() => onShowToast(isTe ? 'సెషన్ లాగౌట్ సిమ్యులేషన్ పూర్తయింది' : 'Logged out. Tap persona switcher to sign back in.')}
        >
          <div className="menu-left">
            <span className="menu-icon">🚪</span>
            <span className="menu-title">{isTe ? 'లాగ్ అవుట్' : 'Logout'}</span>
          </div>
        </div>
      </div>

      {/* Address Parcels Modal */}
      {showAddressModal && (
        <div className="modal-backdrop" onClick={() => setShowAddressModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isTe ? 'నమోదైన పొలాలు' : 'Registered Farm Parcels'}</h3>
              <button type="button" className="close-btn" onClick={() => setShowAddressModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="farm-parcel-item">
                <div className="parcel-header">
                  <strong>🌾 Dundigam East Paddy Field</strong>
                  <span className="default-pill">Primary</span>
                </div>
                <p>Dundigam Village, Nellore District, AP • 5.5 Acres</p>
              </div>
              <div className="farm-parcel-item">
                <div className="parcel-header">
                  <strong>☁️ Nellore Chilli & Paddy Land</strong>
                </div>
                <p>Dundigam Rural, Nellore District, AP • 8.0 Acres</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setShowAddressModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
