import React, { useState } from 'react';
import { Language, ScreenType, Persona } from '../types';

interface AdminDashboardScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  onChangePersona: (p: Persona) => void;
  onShowToast: (msg: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  lang,
  onNavigate,
  onChangePersona,
  onShowToast,
}) => {
  const isTe = lang === 'te';

  const [opsQueue, setOpsQueue] = useState([
    {
      id: 'SVAG2405241234',
      farmer: 'Bhanu Kapa (డుండిగం గ్రామం, నెల్లూరు)',
      service: 'ట్రాక్టర్ దుక్కి (45 HP Rotavator)',
      quotedRate: 1200,
      benchmarkRate: 1250,
      status: 'PENDING_REVIEW',
    },
    {
      id: 'SVAG2405241199',
      farmer: 'Kapa Nani (డుండిగం రూరల్, నెల్లూరు)',
      service: 'డ్రోన్ స్ప్రేయింగ్ (5 ఎకరాలు)',
      quotedRate: 1750,
      benchmarkRate: 1750,
      status: 'APPROVED',
    },
    {
      id: 'SVAG2405241155',
      farmer: 'Bhanu Naidu (నెల్లూరు సిటీ)',
      service: 'హార్వెస్టర్ కోత (3 ఎకరాలు)',
      quotedRate: 7500,
      benchmarkRate: 7600,
      status: 'PENDING_REVIEW',
    },
  ]);

  const handleApproveQuote = (id: string) => {
    setOpsQueue(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );
    onShowToast(isTe ? `కోట్ #${id} ఆపరేషన్స్ ద్వారా ధృవీకరించబడింది!` : `Quote #${id} approved within benchmark! Cleared for farmer view.`);
  };

  return (
    <div className="screen-content admin-screen">
      {/* Admin Header (Image 2 Frame 11) */}
      <div className="admin-header-card">
        <div>
          <span className="admin-badge">GOVERNANCE & OPS</span>
          <h3 className="admin-title">{isTe ? 'అడ్మిన్ & ఆపరేషన్స్ డ్యాష్‌బోర్డ్' : 'Operations Administration Hub'}</h3>
          <p className="admin-sub">Akanksha Agree Tech Platform Metrics (AP & TG)</p>
        </div>
      </div>

      {/* 4 Metrics Cards (Image 2 Frame 11) */}
      <div className="admin-metrics-grid">
        <div className="admin-stat-card">
          <span className="stat-label">{isTe ? 'వినియోగదారులు' : 'Active Farmers'}</span>
          <div className="stat-number">12,458</div>
          <span className="stat-trend positive">↑ +14% this month</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">{isTe ? 'మొత్తం బుకింగ్స్' : 'Completed Bookings'}</span>
          <div className="stat-number">2,342</div>
          <span className="stat-trend positive">↑ +8% this week</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">{isTe ? 'ఎకరాల విస్తీర్ణం' : 'Acres Serviced'}</span>
          <div className="stat-number">18,739</div>
          <span className="stat-trend neutral">Paddy & Cotton</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">{isTe ? 'మొత్తం చెల్లింపులు' : 'Platform Volume'}</span>
          <div className="stat-number">₹4,25,680</div>
          <span className="stat-trend positive">99.8% Settled</span>
        </div>
      </div>

      {/* 7-Day Performance Trend Chart (Image 2 Frame 11) */}
      <div className="admin-chart-card">
        <div className="chart-header">
          <h4>{isTe ? 'గత 7 రోజుల బుకింగ్స్ సరళి' : 'Last 7 Days Bookings Trend'}</h4>
          <span className="chart-metric-tag">Peak: 3.4k/day</span>
        </div>

        <div className="svg-trend-chart-container">
          <svg viewBox="0 0 320 120" className="trend-svg">
            {/* Horizontal Grid lines */}
            <line x1="20" y1="20" x2="300" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="20" y1="55" x2="300" y2="55" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="20" y1="90" x2="300" y2="90" stroke="#e2e8f0" strokeDasharray="3 3" />

            {/* Area Fill */}
            <path
              d="M 30 85 Q 70 70, 110 80 T 160 45 T 210 65 T 250 40 T 290 50 L 290 100 L 30 100 Z"
              fill="rgba(46, 125, 50, 0.12)"
            />

            {/* Line */}
            <path
              d="M 30 85 Q 70 70, 110 80 T 160 45 T 210 65 T 250 40 T 290 50"
              fill="none"
              stroke="#2e7d32"
              strokeWidth="3"
            />

            {/* Points */}
            <circle cx="30" cy="85" r="4" fill="#2e7d32" />
            <circle cx="70" cy="74" r="4" fill="#2e7d32" />
            <circle cx="110" cy="80" r="4" fill="#2e7d32" />
            <circle cx="160" cy="45" r="5" fill="#1b5e20" />
            <circle cx="210" cy="65" r="4" fill="#2e7d32" />
            <circle cx="250" cy="40" r="4" fill="#2e7d32" />
            <circle cx="290" cy="50" r="4" fill="#2e7d32" />

            {/* Labels */}
            <text x="22" y="112" fontSize="9" fill="#64748b">18 May</text>
            <text x="65" y="112" fontSize="9" fill="#64748b">19 May</text>
            <text x="105" y="112" fontSize="9" fill="#64748b">20 May</text>
            <text x="150" y="112" fontSize="9" fill="#64748b">21 May</text>
            <text x="200" y="112" fontSize="9" fill="#64748b">22 May</text>
            <text x="242" y="112" fontSize="9" fill="#64748b">23 May</text>
            <text x="280" y="112" fontSize="9" fill="#64748b">24 May</text>
          </svg>
        </div>
      </div>

      {/* Operations Price Review Queue (Image 2 Frame 11) */}
      <div className="section-title-row">
        <h3 className="section-title-text">{isTe ? 'తాజా బుకింగ్స్ & సమీక్ష క్యూ' : 'Ops Price Review Queue'}</h3>
      </div>

      <div className="admin-queue-list">
        {opsQueue.map(item => (
          <div key={item.id} className="admin-queue-card">
            <div className="queue-card-top">
              <span className="queue-id">#{item.id}</span>
              <span className={`queue-status-tag ${item.status.toLowerCase()}`}>
                {item.status === 'APPROVED' ? (isTe ? '✓ క్లియర్ చేయబడింది' : '✓ Approved') : (isTe ? 'సమీక్షలో ఉంది' : 'Pending Review')}
              </span>
            </div>

            <div className="queue-body">
              <strong>{item.farmer}</strong>
              <p>{item.service}</p>
              <div className="queue-rate-compare">
                <span>Quoted: <strong>₹{item.quotedRate}</strong></span>
                <span>District Benchmark: ₹{item.benchmarkRate}</span>
              </div>
            </div>

            {item.status === 'PENDING_REVIEW' && (
              <div className="queue-actions-row">
                <button
                  type="button"
                  className="approve-quote-btn"
                  onClick={() => handleApproveQuote(item.id)}
                >
                  ✓ {isTe ? 'రేట్ క్లియర్ చేయండి' : 'Approve & Release to Farmer'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Switch Back Button */}
      <div className="switch-back-bar">
        <button
          type="button"
          className="switch-back-btn"
          onClick={() => {
            onChangePersona('farmer');
            onNavigate('home');
          }}
        >
          ← {isTe ? 'రైతు పోర్టల్‌కు తిరిగి వెళ్లండి' : 'Return to Farmer App'}
        </button>
      </div>
    </div>
  );
};
