import React, { useState, useEffect } from 'react';
import { Language, ScreenType, BookingRecord } from '../types';

interface LiveTrackingScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  booking?: BookingRecord | null;
  onVerifyOtp: (bookingId: string, otp: string) => Promise<boolean>;
  onShowToast: (msg: string) => void;
}

export const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({
  lang,
  onNavigate: _onNavigate,
  booking,
  onVerifyOtp,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const [currentStep, setCurrentStep] = useState<number>(3); // 1 to 5
  const [eta, setEta] = useState<number>(20);
  const [otpInput, setOtpInput] = useState<string>('123456');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'driver'; text: string; time: string }[]>([
    {
      sender: 'driver',
      text: isTe
        ? 'నమస్కారం సార్, నేను ట్రాక్టర్‌తో బయలుదేరాను. 20 నిమిషాల్లో మీ పొలానికి చేరుకుంటాను.'
        : 'Namaskaram sir, I have started with the tractor. Reaching your field in 20 mins.',
      time: '07:10 AM',
    },
  ]);

  // Animated ETA countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => (prev > 1 ? prev - 1 : 1));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const orderId = booking?.id || 'SVAG2405241234';
  const driverName = booking?.driverName || (isTe ? 'కాప నాని (Kapa Nani)' : 'Kapa Nani (Tractor Operator)');
  const driverPhone = booking?.driverPhone || '+91 98765 43211';
  const equipmentPlate = booking?.equipmentPlate || 'AP 26 AB 1234';

  const steps = [
    { num: 1, label: isTe ? 'ఆర్డర్ చేయబడింది' : 'Order Placed' },
    { num: 2, label: isTe ? 'అంగీకరించింది' : 'Provider Accepted' },
    { num: 3, label: isTe ? 'ప్రయాణంలో ఉన్నారు' : 'En Route' },
    { num: 4, label: isTe ? 'పని జరుగుతోంది' : 'In Progress' },
    { num: 5, label: isTe ? 'పూర్తయింది' : 'Completed' },
  ];

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    const success = await onVerifyOtp(orderId, otpInput);
    setIsVerifying(false);
    if (success) {
      setCurrentStep(5);
      onShowToast(isTe ? 'OTP ధృవీకరించబడింది! పని విజయవంతంగా పూర్తయింది.' : 'OTP Verified! Work marked as completed.');
    } else {
      onShowToast(isTe ? 'సరైన OTP నమోదు చేయండి (టెస్ట్ కోడ్: 123456)' : 'Invalid OTP. Use test OTP: 123456');
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMsg = { sender: 'user' as const, text: chatMessage, time: 'Just now' };
    setChatHistory(prev => [...prev, newMsg]);
    setChatMessage('');
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'driver',
          text: isTe ? 'సరే సార్, మీ సూచనల ప్రకారం చేస్తాను.' : 'Noted sir, will follow your instructions.',
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="screen-content tracking-screen">
      {/* Live Status Header (Image 2 Frame 6) */}
      <div className="tracking-header-status-card">
        <div className="status-top-line">
          <span className="live-pulse-dot" />
          <span className="status-live-text">{isTe ? 'లైవ్ ట్రాకింగ్' : 'LIVE TRACKING'}</span>
        </div>
        <h3 className="tracking-status-title">
          {currentStep === 5
            ? isTe ? 'సేవ విజయవంతంగా పూర్తయింది! 🎉' : 'Service Completed Successfully! 🎉'
            : isTe ? 'మీ సేవ ప్రోగ్రెస్‌లో ఉంది' : 'Your Service is in Progress'}
        </h3>
        <p className="tracking-order-id">
          {isTe ? 'ఆర్డర్ ID:' : 'Order ID:'} <strong>#{orderId}</strong>
        </p>
      </div>

      {/* 5-Step Visual Timeline (Image 2 Frame 6) */}
      <div className="timeline-stepper-card">
        <div className="stepper-track-bar">
          <div
            className="stepper-progress-fill"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <div className="stepper-nodes-row">
          {steps.map(s => {
            const isDone = s.num <= currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <div key={s.num} className={`stepper-node-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="node-circle">{isDone ? '✓' : s.num}</div>
                <span className="node-caption">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Simulated GPS Map (Image 2 Frame 6) */}
      <div className="simulated-field-map">
        <div className="map-grid-overlay" />
        
        {/* Animated GPS Path SVG */}
        <svg className="map-svg-path" viewBox="0 0 340 180">
          {/* Farm Plots Background */}
          <rect x="15" y="15" width="90" height="60" rx="6" fill="#e8f5e9" stroke="#c8e6c9" strokeWidth="1" />
          <text x="25" y="45" fontSize="10" fill="#2e7d32">Paddy Plot A</text>

          <rect x="120" y="20" width="100" height="70" rx="6" fill="#f1f8e9" stroke="#dcedc8" strokeWidth="1" />
          <text x="130" y="55" fontSize="10" fill="#33691e">Chilli Plot B</text>

          <rect x="235" y="60" width="95" height="90" rx="6" fill="#e0f2f1" stroke="#b2dfdb" strokeWidth="1" />
          <text x="240" y="95" fontSize="10" fill="#004d40">Dundigam Farm</text>

          {/* Dotted Route */}
          <path
            d="M 40 130 Q 110 140, 160 100 T 260 90"
            fill="none"
            stroke="#1b5e20"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            className="animated-dash-path"
          />

          {/* Destination Pin */}
          <circle cx="260" cy="90" r="8" fill="#d32f2f" />
          <circle cx="260" cy="90" r="14" fill="#d32f2f" opacity="0.3" className="pulse-circle" />
          <text x="255" y="94" fontSize="11" fill="#fff" fontWeight="bold">📍</text>
        </svg>

        {/* Animated Moving Tractor Pin */}
        <div className="animated-vehicle-marker">
          <span className="vehicle-glyph">🚜</span>
          <span className="driver-bubble">Kapa Nani</span>
        </div>

        <div className="map-floating-overlay">
          <span className="speed-badge">⚡ 18 km/h</span>
          <span className="eta-badge">⏱️ {eta} {isTe ? 'నిమిషాలు' : 'mins'}</span>
        </div>
      </div>

      {/* Driver Information Card (Image 2 Frame 6) */}
      <div className="driver-profile-card">
        <div className="driver-avatar-block">
          <div className="driver-img">👨‍🌾</div>
          <span className="driver-verified-check">✓</span>
        </div>

        <div className="driver-details-block">
          <div className="driver-name-row">
            <h4 className="driver-full-name">{driverName}</h4>
            <span className="driver-rating-pill">★ 4.8</span>
          </div>
          <p className="driver-vehicle-plate">
            {isTe ? 'ట్రాక్టర్ మోడల్:' : 'Tractor:'} <strong>{equipmentPlate}</strong>
          </p>
          <div className="eta-time-counter">
            <span className="eta-clock-icon">⏳</span>
            <span>
              {isTe ? `అంచనా సమయం: ${eta} నిమిషాలు` : `Estimated Arrival: ${eta} Minutes`}
            </span>
          </div>
        </div>

        <div className="driver-contact-actions">
          <button
            type="button"
            className="contact-btn call-action"
            onClick={() => setShowCallModal(true)}
            title="Call Operator"
          >
            📞
          </button>
          <button
            type="button"
            className="contact-btn chat-action"
            onClick={() => setShowChatModal(true)}
            title="Message Operator"
          >
            💬
          </button>
        </div>
      </div>

      {/* OTP Job Verification Section */}
      <div className="otp-verification-card">
        <div className="otp-card-header">
          <span className="otp-badge-title">🔐 {isTe ? 'రైతు కంప్లీషన్ OTP' : 'Completion OTP'}</span>
          <span className="otp-helper">{isTe ? 'పని పూర్తయ్యాక మాత్రమే డ్రైవర్‌కు చెప్పండి' : 'Share with operator ONLY after job completion'}</span>
        </div>
        <div className="otp-display-box">
          <span className="otp-secret-digits">1 2 3 4 5 6</span>
        </div>
        <div className="otp-verify-action-row">
          <input
            type="text"
            value={otpInput}
            onChange={e => setOtpInput(e.target.value)}
            className="otp-input-clean"
            placeholder="Enter OTP"
          />
          <button
            type="button"
            className="otp-submit-btn"
            disabled={isVerifying}
            onClick={handleVerifyOtp}
          >
            {isVerifying ? 'Verifying...' : (isTe ? 'పని పూర్తి చేయండి' : 'Complete Job')}
          </button>
        </div>
      </div>

      {/* Interactive Call Modal */}
      {showCallModal && (
        <div className="modal-backdrop" onClick={() => setShowCallModal(false)}>
          <div className="modal-dialog call-dialog" onClick={e => e.stopPropagation()}>
            <div className="call-avatar-circle">👨‍🌾</div>
            <h3>{driverName}</h3>
            <p className="calling-status">Calling {driverPhone}...</p>
            <div className="call-animation-waves">
              <span /><span /><span />
            </div>
            <button
              type="button"
              className="end-call-btn"
              onClick={() => setShowCallModal(false)}
            >
              End Call ❌
            </button>
          </div>
        </div>
      )}

      {/* Interactive Chat Modal */}
      {showChatModal && (
        <div className="modal-backdrop" onClick={() => setShowChatModal(false)}>
          <div className="modal-dialog chat-dialog" onClick={e => e.stopPropagation()}>
            <div className="chat-modal-header">
              <div className="chat-driver-info">
                <strong>{driverName}</strong>
                <span className="online-tag">● Online</span>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowChatModal(false)}>✕</button>
            </div>
            <div className="chat-messages-container">
              {chatHistory.map((m, idx) => (
                <div key={idx} className={`chat-bubble ${m.sender}`}>
                  <p>{m.text}</p>
                  <span className="chat-time">{m.time}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-bar">
              <input
                type="text"
                placeholder={isTe ? 'సందేశం టైప్ చేయండి...' : 'Type a message to operator...'}
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button type="button" className="send-chat-btn" onClick={handleSendMessage}>
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
