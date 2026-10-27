import React, { useState } from 'react';
import { Language, TractorItem, ScreenType } from '../types';
import { TRACTORS_DATA } from '../data/mockData';

interface TractorBookingScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  onSelectTractor: (tractor: TractorItem) => void;
  onShowToast: (msg: string) => void;
}

export const TractorBookingScreen: React.FC<TractorBookingScreenProps> = ({
  lang,
  onNavigate: _onNavigate,
  onSelectTractor,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filterTabs = [
    { id: 'all', label: isTe ? 'అన్ని ట్రాక్టర్లు' : 'All Tractors' },
    { id: 'operator', label: isTe ? 'ఆపరేటర్‌తో' : 'With Operator' },
    { id: 'implements', label: isTe ? 'పరికరాలు' : 'Implements' },
    { id: 'packages', label: isTe ? 'ప్యాకేజీలు' : 'Packages' },
  ];

  const filteredTractors = TRACTORS_DATA.filter(t => {
    if (activeFilter === 'operator' && !t.withOperator) return false;
    return true;
  });

  const handleBook = (tractor: TractorItem) => {
    onSelectTractor(tractor);
    onShowToast(isTe ? `${tractor.nameTe} ఎంపికైంది! బుకింగ్ వివరాలకు వెళ్తున్నారు...` : `${tractor.name} selected! Proceeding to booking...`);
  };

  return (
    <div className="screen-content tractor-screen">
      {/* Visual Header Banner (Image 1 Frame 4) */}
      <div className="category-hero-card tractor-hero">
        <div className="category-hero-text">
          <span className="hero-tag-badge">Verified Local Operators</span>
          <h2>{isTe ? 'ఆపరేటర్ & పరికరాలతో ట్రాక్టర్ల అద్దె' : 'Rent Tractors with Operator & Implements'}</h2>
          <p>{isTe ? 'అందుబాటులో ఉన్న అధునాతన ట్రాక్టర్లు గంట లేదా ఎకరం ప్రాతిపదికన' : 'Available for immediate hire. Transparent hourly rates, GPS tracked'}</p>
        </div>
        <div className="category-hero-icon">🚜💨</div>
      </div>

      {/* Filter Tabs (Image 1 Frame 4) */}
      <div className="category-pills-scroll">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`category-pill ${activeFilter === tab.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <div className="section-title-row">
        <h3 className="section-title-text">{isTe ? 'ట్రాక్టర్ ఎంచుకోండి' : 'Select Tractor'}</h3>
        <span className="section-view-all">({filteredTractors.length} {isTe ? 'మోడల్స్' : 'models'})</span>
      </div>

      {/* Tractor Listing Cards (Image 1 Frame 4) */}
      <div className="tractors-listing-col">
        {filteredTractors.map(tractor => (
          <div key={tractor.id} className="tractor-detail-card">
            <div className="tractor-card-main">
              <div className="tractor-icon-badge">
                <span className="tractor-glyph">🚜</span>
                {tractor.tag && <span className="tractor-tag-chip">{tractor.tag}</span>}
              </div>

              <div className="tractor-info-block">
                <div className="tractor-title-row">
                  <h4 className="tractor-model-name">{isTe ? tractor.nameTe : tractor.name}</h4>
                  <span className="tractor-rating">★ {tractor.rating}</span>
                </div>
                <div className="tractor-specs-meta">
                  <span className="spec-pill hp-pill">⚡ {tractor.hp}</span>
                  <span className="spec-pill op-pill">
                    {tractor.withOperator ? (isTe ? '✓ ఆపరేటర్‌తో' : '✓ With Operator') : (isTe ? 'డ్రైవర్ లేకుండా' : 'Machine Only')}
                  </span>
                  <span className="spec-pill trip-pill">🏅 {tractor.tripsCompleted} {isTe ? 'పనులు' : 'trips'}</span>
                </div>
                <p className="tractor-implement-text">
                  <span className="implement-label">{isTe ? 'అటాచ్ చేసిన పరికరం:' : 'Implement:'}</span> {tractor.implement}
                </p>
              </div>
            </div>

            <div className="tractor-action-footer">
              <div className="tractor-rate-box">
                <span className="rate-currency">₹</span>
                <span className="rate-amount">{tractor.ratePerHour.toLocaleString('en-IN')}</span>
                <span className="rate-period">/ {isTe ? 'గంట' : 'hour'}</span>
              </div>
              <button
                type="button"
                className="tractor-book-btn"
                onClick={() => handleBook(tractor)}
              >
                {isTe ? 'ఇప్పుడే బుక్ చేయండి' : 'Book Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
