import React from 'react';
import { ScreenType, Language } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  lang: Language;
  farmerName: string;
  selectedDistrict: string;
  onOpenBookingFlow: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  lang,
  farmerName,
  selectedDistrict,
  onOpenBookingFlow,
}) => {
  const isTe = lang === 'te';

  return (
    <div className="screen-content home-screen">
      {/* Search Input Bar (from Frame 1 & Image 2) */}
      <div className="home-search-bar">
        <div className="search-input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={isTe ? 'ట్రాక్టర్, డ్రోన్, విత్తనాలు లేదా ఎరువుల కోసం వెతకండి...' : 'Search tractors, drones, seeds, fertilizers...'}
            onClick={() => onNavigate('store')}
            readOnly
          />
        </div>
      </div>

      {/* Main Hero Banner (from Image 1 Frame 1 & Image 2 Frame 1) */}
      <section className="hero-banner-card">
        <div className="hero-text-content">
          <span className="hero-greeting-pill">
            {isTe ? `స్వాగతం ${farmerName} గారు 👋` : `Welcome, ${farmerName} 👋`}
          </span>
          <h2 className="hero-heading">
            {isTe ? 'స్మార్ట్ ఫార్మింగ్ — మెరుగైన భవిష్యత్తు' : 'Smart Farming, Better Tomorrow'}
          </h2>
          <p className="hero-subheading">
            {isTe ? 'అధునాతన వ్యవసాయ సేవలు ఇప్పుడు మీ ముంగిట' : 'All Solutions for Modern Farmers across AP & TG'}
          </p>
          <button
            type="button"
            className="hero-action-btn"
            onClick={onOpenBookingFlow}
          >
            {isTe ? 'ఇప్పుడే బుక్ చేయండి →' : 'Book Services Now →'}
          </button>
        </div>
        <div className="hero-banner-graphic">
          <span className="hero-tractor-art">🚜</span>
          <span className="hero-drone-art">🚁</span>
        </div>
      </section>

      {/* 6 Core Services Grid (Image 1 Frame 1) */}
      <section className="services-grid-section">
        <div className="section-title-row">
          <h3 className="section-title-text">{isTe ? 'సేవా విభాగాలు' : 'All Farming Services'}</h3>
          <span className="section-view-all" onClick={onOpenBookingFlow}>
            {isTe ? 'చూడండి >' : 'View All >'}
          </span>
        </div>

        <div className="services-grid-2x3">
          {/* 1. Drip Irrigation */}
          <button
            type="button"
            className="service-card-item drip-theme"
            onClick={() => onNavigate('drip')}
          >
            <div className="service-icon-box">💧</div>
            <div className="service-text-box">
              <h4 className="service-card-title">{isTe ? 'ఇరిగేషన్ సేవలు' : 'Drip Irrigation'}</h4>
              <p className="service-card-desc">{isTe ? 'నీటి ఆదా, అధిక దిగుబడి' : 'Save Water, Increase Yield'}</p>
            </div>
          </button>

          {/* 2. Drone Services */}
          <button
            type="button"
            className="service-card-item drone-theme"
            onClick={() => onNavigate('drone')}
          >
            <div className="service-icon-box">🚁</div>
            <div className="service-text-box">
              <h4 className="service-card-title">{isTe ? 'డ్రోన్ సర్వీసులు' : 'Drone Services'}</h4>
              <p className="service-card-desc">{isTe ? 'స్ప్రే, మ్యాపింగ్, పర్యవేక్షణ' : 'Spray, Map, Monitor Crops'}</p>
            </div>
          </button>

          {/* 3. Tractor Booking */}
          <button
            type="button"
            className="service-card-item tractor-theme"
            onClick={() => onNavigate('tractor')}
          >
            <div className="service-icon-box">🚜</div>
            <div className="service-text-box">
              <h4 className="service-card-title">{isTe ? 'ట్రాక్టర్ సేవలు' : 'Tractor Booking'}</h4>
              <p className="service-card-desc">{isTe ? 'ఆపరేటర్‌తో ట్రాక్టర్ల అద్దె' : 'Rent Tractors with Operator'}</p>
            </div>
          </button>

          {/* 4. Farm Machines */}
          <button
            type="button"
            className="service-card-item machines-theme"
            onClick={() => onNavigate('machines')}
          >
            <div className="service-icon-box">⚙️</div>
            <div className="service-text-box">
              <h4 className="service-card-title">{isTe ? 'వ్యవసాయ యంత్రాలు' : 'Farm Machines'}</h4>
              <p className="service-card-desc">{isTe ? 'హార్వెస్టర్, రొటవేటర్, జేసీబీ' : 'All Farming Machines for Hire'}</p>
            </div>
          </button>

          {/* 5. Agri Store */}
          <button
            type="button"
            className="service-card-item store-theme"
            onClick={() => onNavigate('store')}
          >
            <div className="service-icon-box">🛒</div>
            <div className="service-text-box">
              <h4 className="service-card-title">{isTe ? 'అగ్రి స్టోర్' : 'Agri Store'}</h4>
              <p className="service-card-desc">{isTe ? 'విత్తనాలు, ఎరువులు, మందులు' : 'Everything for your Farm'}</p>
            </div>
          </button>

          {/* 6. Expert Support */}
          <button
            type="button"
            className="service-card-item support-theme"
            onClick={() => onNavigate('support')}
          >
            <div className="service-icon-box">🎧</div>
            <div className="service-text-box">
              <h4 className="service-card-title">{isTe ? 'వ్యవసాయ నిపుణులు' : 'Expert Support'}</h4>
              <p className="service-card-desc">{isTe ? '24x7 ఉచిత సలహాలు' : 'Talk to Experts 24x7'}</p>
            </div>
          </button>
        </div>
      </section>

      {/* Special Offer Banner (Image 2 Frame 1) */}
      <section className="promo-offer-banner">
        <div className="promo-badge">{isTe ? 'ప్రత్యేక ఆఫర్' : 'SPECIAL OFFER'}</div>
        <div className="promo-content">
          <h4 className="promo-headline">
            {isTe ? 'డ్రోన్ స్ప్రేయింగ్ పై 20% డిస్కౌంట్' : '20% OFF on First Drone Spraying'}
          </h4>
          <p className="promo-sub">
            {isTe ? 'ఈ రోజే బుక్ చేసుకోండి • కోడ్: KISAN20' : 'Instant booking with verified operators • Code: KISAN20'}
          </p>
          <button
            type="button"
            className="promo-btn"
            onClick={() => onNavigate('drone')}
          >
            {isTe ? 'ఇప్పుడే బుక్ చేయండి' : 'Claim Offer'}
          </button>
        </div>
        <div className="promo-art">🌾🚁</div>
      </section>

      {/* Today's Update Weather Card (Image 1 Frame 1) */}
      <section className="today-update-section">
        <div className="section-title-row">
          <h3 className="section-title-text">{isTe ? 'నేటి వాతావరణ సమాచారం' : "Today's Update"}</h3>
          <span className="live-indicator-pill">● LIVE</span>
        </div>

        <div className="weather-card-widget">
          <div className="weather-temp-col">
            <span className="weather-icon-sun">⛅</span>
            <div>
              <div className="weather-temp-num">28°C</div>
              <div className="weather-desc-text">{isTe ? 'పాక్షిక మేఘావృతం' : 'Partly Cloudy'}</div>
            </div>
          </div>
          <div className="weather-metrics-col">
            <div className="weather-location-name">📍 {selectedDistrict}</div>
            <div className="weather-sub-metrics">
              <div className="sub-metric">
                <span className="metric-label">{isTe ? 'తేమ' : 'Humidity'}:</span>
                <span className="metric-val">65%</span>
              </div>
              <div className="sub-metric">
                <span className="metric-label">{isTe ? 'గాలి వేగం' : 'Wind'}:</span>
                <span className="metric-val">12 km/h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Booking Flow CTA */}
      <section className="quick-booking-prompt">
        <div className="prompt-inner">
          <div className="prompt-icon">🌱</div>
          <div className="prompt-text">
            <h4>{isTe ? 'మీ పొలానికి సేవ కావాలా?' : 'Need mechanization for your field?'}</h4>
            <p>{isTe ? 'వరి, మొక్కజొన్న, పత్తి - అన్ని పంటలకు సులభమైన బుకింగ్' : 'Select crop & equipment in 2 quick steps'}</p>
          </div>
          <button
            type="button"
            className="prompt-action-btn"
            onClick={onOpenBookingFlow}
          >
            {isTe ? 'ప్రారంభించండి →' : 'Start →'}
          </button>
        </div>
      </section>
    </div>
  );
};
