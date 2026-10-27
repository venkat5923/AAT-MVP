import React, { useState } from 'react';
import { Language, ScreenType } from '../types';
import { DRONE_SERVICES_DATA } from '../data/mockData';

interface DroneServicesScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  onInitiateBooking: (bookingDetails: any) => void;
  onShowToast: (msg: string) => void;
}

export const DroneServicesScreen: React.FC<DroneServicesScreenProps> = ({
  lang,
  onNavigate: _onNavigate,
  onInitiateBooking,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const [selectedServiceId, setSelectedServiceId] = useState<string>('drone-spray');
  const [selectedCrop, setSelectedCrop] = useState<string>('Paddy (వరిధాన్యం)');
  const [selectedArea, setSelectedArea] = useState<number>(5);
  const [bookingDate, setBookingDate] = useState<string>('2026-11-06');
  const [timeSlot, setTimeSlot] = useState<string>('Morning (06:00 AM - 09:00 AM)');

  const selectedService = DRONE_SERVICES_DATA.find(s => s.id === selectedServiceId) || DRONE_SERVICES_DATA[0];
  const calculatedTotal = selectedService.pricePerAcre * selectedArea;

  const handleBookNow = () => {
    const bookingDetails = {
      type: 'drone',
      serviceName: isTe ? selectedService.titleTe : selectedService.title,
      crop: selectedCrop,
      area: selectedArea,
      date: bookingDate,
      time: timeSlot,
      ratePerAcre: selectedService.pricePerAcre,
      totalAmount: calculatedTotal,
      details: `${selectedCrop} • ${selectedArea} Acres • ${selectedService.title}`,
      detailsTe: `${selectedCrop} • ${selectedArea} ఎకరాలు • ${selectedService.titleTe}`,
    };
    onInitiateBooking(bookingDetails);
    onShowToast(isTe ? 'డ్రోన్ సేవ వివరాలు ఖరారయ్యాయి! బుకింగ్ సమ్మరీకి కొనసాగండి.' : 'Drone service configured! Reviewing summary...');
  };

  return (
    <div className="screen-content drone-screen">
      {/* Visual Header Banner (Image 1 Frame 3) */}
      <div className="category-hero-card drone-hero">
        <div className="category-hero-text">
          <span className="hero-tag-badge">DGCA Certified Operators</span>
          <h2>{isTe ? 'అధునాతన డ్రోన్ వ్యవసాయ పరిష్కారాలు' : 'Advanced Drone Solutions'}</h2>
          <p>{isTe ? 'అధిక ఉత్పాదకత, రసాయనాల ఆదా మరియు త్వరిత స్ప్రేయింగ్' : 'Precision spraying, NDVI multispectral health analysis & aerial surveying'}</p>
        </div>
        <div className="category-hero-icon">🚁✨</div>
      </div>

      {/* 6 Drone Services Grid */}
      <div className="section-title-row">
        <h3 className="section-title-text">{isTe ? 'డ్రోన్ సేవలు' : 'Drone Aviation Services'}</h3>
      </div>

      <div className="drone-services-grid">
        {DRONE_SERVICES_DATA.map(service => {
          const isSelected = selectedServiceId === service.id;
          return (
            <div
              key={service.id}
              className={`drone-service-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedServiceId(service.id)}
            >
              <div className="drone-card-top">
                <span className="drone-icon">{service.icon}</span>
                <span className="drone-price-pill">₹{service.pricePerAcre} / ac</span>
              </div>
              <h4 className="drone-card-title">{isTe ? service.titleTe : service.title}</h4>
              <p className="drone-card-desc">{isTe ? service.descTe : service.desc}</p>
              <button
                type="button"
                className={`drone-select-btn ${isSelected ? 'active' : ''}`}
              >
                {isSelected ? (isTe ? '✓ ఎంపికైంది' : '✓ Selected') : (isTe ? 'ఎంచుకోండి' : 'Select')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive Booking Form (Image 1 Frame 3) */}
      <section className="drone-booking-form-card">
        <div className="form-card-header">
          <h3>{isTe ? 'డ్రోన్ సర్వీస్ బుక్ చేయండి' : 'Book a Drone Service'}</h3>
          <span className="rate-badge">₹{selectedService.pricePerAcre} / acre</span>
        </div>

        <div className="form-grid-inputs">
          <div className="form-field">
            <label>{isTe ? 'సేవను ఎంచుకోండి' : 'Select Service'}</label>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="styled-select"
            >
              {DRONE_SERVICES_DATA.map(s => (
                <option key={s.id} value={s.id}>
                  {isTe ? s.titleTe : s.title} (₹{s.pricePerAcre}/ac)
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>{isTe ? 'పంటను ఎంచుకోండి' : 'Select Crop'}</label>
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="styled-select"
            >
              <option value="Paddy (వరిధాన్యం)">Paddy (వరిధాన్యం)</option>
              <option value="Cotton (పత్తి)">Cotton (పత్తి)</option>
              <option value="Chilli (మిర్చి)">Chilli (మిర్చి)</option>
              <option value="Maize (మొక్కజొన్న)">Maize (మొక్కజొన్న)</option>
              <option value="Groundnut (వేరుశనగ)">Groundnut (వేరుశనగ)</option>
            </select>
          </div>

          <div className="form-field">
            <label>{isTe ? 'విస్తీర్ణం ఎంచుకోండి' : 'Select Area (Acres)'}</label>
            <select
              value={selectedArea}
              onChange={e => setSelectedArea(Number(e.target.value))}
              className="styled-select"
            >
              <option value={1}>1 Acre (₹{selectedService.pricePerAcre * 1})</option>
              <option value={2.5}>2.5 Acres (₹{selectedService.pricePerAcre * 2.5})</option>
              <option value={5}>5 Acres (₹{selectedService.pricePerAcre * 5})</option>
              <option value={10}>10 Acres (₹{selectedService.pricePerAcre * 10})</option>
              <option value={20}>20 Acres (₹{selectedService.pricePerAcre * 20})</option>
            </select>
          </div>

          <div className="form-field">
            <label>{isTe ? 'తేదీ & సమయం' : 'Preferred Date & Window'}</label>
            <div className="date-time-row">
              <input
                type="date"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                className="styled-input"
              />
              <select
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="styled-select"
              >
                <option value="Morning (06:00 AM - 09:00 AM)">Morning (06:00 AM - 09:00 AM)</option>
                <option value="Afternoon (04:00 PM - 06:30 PM)">Afternoon (04:00 PM - 06:30 PM)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-total-summary-row">
          <div className="total-calculation-text">
            <span>{isTe ? 'అంచనా మొత్తం:' : 'Estimated Total:'}</span>
            <div className="price-big">₹{calculatedTotal.toLocaleString('en-IN')}</div>
          </div>
          <button
            type="button"
            className="book-now-cta-btn"
            onClick={handleBookNow}
          >
            {isTe ? 'ఇప్పుడే బుక్ చేయండి →' : 'Book Now →'}
          </button>
        </div>
      </section>
    </div>
  );
};
