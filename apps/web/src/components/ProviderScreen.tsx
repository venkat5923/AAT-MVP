import React, { useState, useEffect } from 'react';
import { Language, ScreenType, Persona } from '../types';

interface ProviderScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  persona: Persona;
  onChangePersona: (p: Persona) => void;
  onShowToast: (msg: string) => void;
}

export const ProviderScreen: React.FC<ProviderScreenProps> = ({
  lang,
  onNavigate,
  persona,
  onChangePersona,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const isDrone = persona === 'provider_drone';

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'new' | 'ongoing' | 'completed'>('new');
  const [countdown, setCountdown] = useState<number>(930); // 15 mins 30 secs
  const [orders, setOrders] = useState([
    {
      id: 'REQ-101',
      title: isDrone ? 'Paddy - Drone Spraying (వరిధాన్యం - డ్రోన్ స్ప్రేయింగ్)' : 'Paddy - Tractor Plowing (వరిధాన్యం - ట్రాక్టర్ దుక్కి)',
      titleTe: isDrone ? 'వరిధాన్యం - డ్రోన్ స్ప్రేయింగ్' : 'వరిధాన్యం - ట్రాక్టర్ దుక్కి',
      amount: isDrone ? 350 : 1200,
      area: '1 Acre • 24 May 2024, 7:00 AM',
      location: 'Dundigam Village, Nellore District',
      locationTe: 'డుండిగం గ్రామం, నెల్లూరు జిల్లా',
      status: 'pending',
    },
    {
      id: 'REQ-102',
      title: isDrone ? 'Cotton - Pest Scouting (పత్తి - డ్రోన్ స్కౌటింగ్)' : 'Maize - Rotavator (మొక్కజొన్న - రోటా వేటర్)',
      titleTe: isDrone ? 'పత్తి - డ్రోన్ స్కౌటింగ్' : 'మొక్కజొన్న - రోటా వేటర్',
      amount: isDrone ? 1050 : 3000,
      area: '2 Acres • 24 May 2024, 3:00 PM',
      location: 'Dundigam East Farm, Nellore',
      locationTe: 'డుండిగం తూర్పు చేను, నెల్లూరు',
      status: 'pending',
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAccept = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'accepted' } : o))
    );
    onShowToast(isTe ? 'ఆర్డర్ అంగీకరించబడింది! రూట్ మ్యాప్ సిద్ధంగా ఉంది.' : 'Order accepted! Starting dispatch navigation...');
  };

  return (
    <div className="screen-content provider-screen">
      {/* Provider Header (Image 2 Frames 9 & 10) */}
      <div className="provider-header-card">
        <div className="provider-header-left">
          <div className="provider-avatar-circle">{isDrone ? '🚁' : '🚜'}</div>
          <div>
            <h3 className="provider-title-text">
              {isDrone
                ? (isTe ? 'డ్రోన్ ఆపరేటర్ పోర్టల్' : 'Drone Operator Portal')
                : (isTe ? 'ట్రాక్టర్ ఓనర్ పోర్టల్' : 'Tractor Owner Portal')}
            </h3>
            <span className="provider-location-text">📍 Dundigam Village, Nellore Hub</span>
          </div>
        </div>

        <button
          type="button"
          className={`online-toggle-btn ${isOnline ? 'online' : 'offline'}`}
          onClick={() => setIsOnline(!isOnline)}
        >
          ● {isOnline ? (isTe ? 'ఆన్‌లైన్' : 'Online') : (isTe ? 'ఆఫ్‌లైన్' : 'Offline')}
        </button>
      </div>

      {/* Daily Earnings Card */}
      <div className="provider-earnings-card">
        <div className="earnings-item">
          <span className="earnings-label">{isTe ? 'నేటి ఆదాయం' : "Today's Earnings"}</span>
          <span className="earnings-val">₹4,200</span>
        </div>
        <div className="earnings-divider" />
        <div className="earnings-item">
          <span className="earnings-label">{isTe ? 'పూర్తయిన పనులు' : 'Completed Trips'}</span>
          <span className="earnings-val">3</span>
        </div>
        <div className="earnings-divider" />
        <div className="earnings-item">
          <span className="earnings-label">{isTe ? 'రేటింగ్' : 'Partner Rating'}</span>
          <span className="earnings-val">★ 4.9</span>
        </div>
      </div>

      {/* Tabs Row (Image 2 Frames 9 & 10) */}
      <div className="category-pills-scroll">
        <button
          type="button"
          className={`category-pill ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          {isTe ? 'కొత్త ఆర్డర్లు (2)' : 'New Orders (2)'}
        </button>
        <button
          type="button"
          className={`category-pill ${activeTab === 'ongoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('ongoing')}
        >
          {isTe ? 'అంగీకరించినవి' : 'Accepted (1)'}
        </button>
        <button
          type="button"
          className={`category-pill ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          {isTe ? 'పూర్తయినవి' : 'Completed (8)'}
        </button>
      </div>

      {/* Orders List with Countdown (Image 2 Frames 9 & 10) */}
      <div className="provider-orders-col">
        {orders.map(order => (
          <div key={order.id} className="provider-order-card">
            <div className="provider-order-header">
              <span className="order-target-crop">{isTe ? order.titleTe : order.title}</span>
              <span className="order-price-bold">₹{order.amount.toLocaleString('en-IN')}</span>
            </div>

            <p className="order-location-sub">
              📍 {isTe ? order.locationTe : order.location} • {order.area}
            </p>

            <div className="provider-order-footer">
              <div className="countdown-pill">
                <span>⏱️ {formatCountdown(countdown)}</span>
              </div>

              <div className="order-actions-cluster">
                <button
                  type="button"
                  className="provider-details-btn"
                  onClick={() => onShowToast(`Order Details: ${order.title}`)}
                >
                  {isTe ? 'వివరాలు' : 'Details'}
                </button>
                <button
                  type="button"
                  className="provider-accept-btn"
                  onClick={() => handleAccept(order.id)}
                >
                  {order.status === 'accepted' ? (isTe ? '✓ అంగీకరించబడింది' : '✓ Accepted') : (isTe ? 'అంగీకరించండి' : 'Accept Order')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back to Farmer App Button */}
      <div className="switch-back-bar">
        <button
          type="button"
          className="switch-back-btn"
          onClick={() => {
            onChangePersona('farmer');
            onNavigate('home');
          }}
        >
          ← {isTe ? 'రైతు పోర్టల్‌కు తిరిగి వెళ్లండి' : 'Switch Back to Farmer Mode'}
        </button>
      </div>
    </div>
  );
};
