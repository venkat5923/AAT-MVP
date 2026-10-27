import React, { useState } from 'react';
import { Language, ScreenType, CropItem } from '../types';

interface BookingSummaryScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  selectedCrop: CropItem;
  acres: number;
  selectedServices: any[];
  totalAmount: number;
  farmerAddress: string;
  onProceedToPayment: (bookingMeta: any) => void;
}

export const BookingSummaryScreen: React.FC<BookingSummaryScreenProps> = ({
  lang,
  onNavigate,
  selectedCrop,
  acres,
  selectedServices,
  totalAmount,
  farmerAddress,
  onProceedToPayment,
}) => {
  const isTe = lang === 'te';

  const [date, setDate] = useState<string>('2026-11-06');
  const [time, setTime] = useState<string>('07:00 AM');
  const [address, setAddress] = useState<string>(
    farmerAddress || 'Dundigam Village, Nellore District, Andhra Pradesh'
  );

  const handleProceed = () => {
    onProceedToPayment({
      date,
      time,
      address,
      selectedCrop,
      acres,
      selectedServices,
      totalAmount,
    });
    onNavigate('payment');
  };

  return (
    <div className="screen-content booking-summary-screen">
      {/* 1. Chosen Crop Section (Image 2 Frame 4) */}
      <div className="summary-card crop-summary-card">
        <div className="summary-card-header">
          <span className="card-section-label">{isTe ? 'ఎంపిక చేసిన పంట' : 'Selected Crop'}</span>
          <button
            type="button"
            className="link-btn"
            onClick={() => onNavigate('crop_selection')}
          >
            {isTe ? 'మార్చండి' : 'Change'}
          </button>
        </div>
        <div className="summary-crop-row">
          <span className="crop-badge-icon">{selectedCrop.icon}</span>
          <div>
            <h4 className="crop-title-text">{isTe ? selectedCrop.nameTe : selectedCrop.name}</h4>
            <p className="crop-meta-text">{acres} {isTe ? 'ఎకరాలు' : 'Acres'}</p>
          </div>
        </div>
      </div>

      {/* 2. Itemized Services (Image 2 Frame 4) */}
      <div className="summary-card services-summary-card">
        <div className="summary-card-header">
          <span className="card-section-label">{isTe ? 'ఎంపిక చేసిన సేవలు' : 'Selected Services'}</span>
          <button
            type="button"
            className="link-btn"
            onClick={() => onNavigate('service_selection')}
          >
            {isTe ? 'సవరించండి' : 'Edit'}
          </button>
        </div>

        <div className="itemized-lines-table">
          {selectedServices.map(s => {
            const lineCost = Math.round(s.unitRate * (s.unitType === 'acre' ? acres : 1));
            return (
              <div key={s.id} className="itemized-line-row">
                <span className="line-item-name">
                  {s.icon} {isTe ? s.nameTe : s.name}
                </span>
                <span className="line-item-cost">₹{lineCost.toLocaleString('en-IN')}</span>
              </div>
            );
          })}

          <div className="itemized-divider" />

          <div className="itemized-total-row">
            <span className="total-title">{isTe ? 'మొత్తం (Total Payable)' : 'Total Amount'}</span>
            <span className="total-price">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 3. Schedule Date & Time (Image 2 Frame 4) */}
      <div className="summary-card schedule-summary-card">
        <div className="summary-card-header">
          <span className="card-section-label">{isTe ? 'తేదీ & సమయం' : 'Date & Preferred Time'}</span>
        </div>
        <div className="schedule-picker-inputs">
          <div className="input-with-icon">
            <span>📅</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="styled-input-clean"
            />
          </div>
          <div className="input-with-icon">
            <span>⏰</span>
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              className="styled-select-clean"
            >
              <option value="07:00 AM">07:00 AM (Early Morning Shift)</option>
              <option value="09:00 AM">09:00 AM (Morning Shift)</option>
              <option value="02:00 PM">02:00 PM (Afternoon Shift)</option>
              <option value="04:30 PM">04:30 PM (Evening Shift)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Farm Address (Image 2 Frame 4) */}
      <div className="summary-card address-summary-card">
        <div className="summary-card-header">
          <span className="card-section-label">{isTe ? 'పొలం చిరునామా / లొకేషన్' : 'Field Address / Farm Parcel'}</span>
        </div>
        <div className="address-display-box">
          <span className="address-pin-icon">📍</span>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="address-textarea"
            rows={2}
          />
        </div>
      </div>

      {/* Sticky Bottom Action (Image 2 Frame 4: "కొనసాగించండి") */}
      <div className="sticky-bottom-action-bar">
        <button
          type="button"
          className="bottom-primary-action-btn"
          onClick={handleProceed}
        >
          {isTe ? `కొనసాగించండి (Pay ₹${totalAmount.toLocaleString('en-IN')}) →` : `Proceed to Payment (₹${totalAmount.toLocaleString('en-IN')}) →`}
        </button>
      </div>
    </div>
  );
};
