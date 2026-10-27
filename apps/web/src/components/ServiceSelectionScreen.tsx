import React, { useState } from 'react';
import { Language, ScreenType, CropItem } from '../types';

interface SelectedServiceConfig {
  id: string;
  name: string;
  nameTe: string;
  icon: string;
  unitRate: number;
  unitType: 'acre' | 'hour';
  unitTypeTe: 'ఎకరం' | 'గంట';
  selected: boolean;
}

interface ServiceSelectionScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  selectedCrop: CropItem;
  acres: number;
  onConfirmServices: (services: any[], total: number) => void;
}

export const ServiceSelectionScreen: React.FC<ServiceSelectionScreenProps> = ({
  lang,
  onNavigate,
  selectedCrop,
  acres,
  onConfirmServices,
}) => {
  const isTe = lang === 'te';

  const [services, setServices] = useState<SelectedServiceConfig[]>([
    {
      id: 'plowing',
      name: 'Tractor Plowing (ట్రాక్టర్ దుక్కి)',
      nameTe: 'ట్రాక్టర్ దుక్కి',
      icon: '🚜',
      unitRate: 1200,
      unitType: 'acre',
      unitTypeTe: 'ఎకరం',
      selected: true,
    },
    {
      id: 'rotavator',
      name: 'Rotavator Tillage (రోటా వేటర్)',
      nameTe: 'రోటా వేటర్',
      icon: '⚙️',
      unitRate: 1500,
      unitType: 'acre',
      unitTypeTe: 'ఎకరం',
      selected: true,
    },
    {
      id: 'drone_spray',
      name: 'Drone Spraying (డ్రోన్ స్ప్రేయింగ్)',
      nameTe: 'డ్రోన్ స్ప్రేయింగ్',
      icon: '🚁',
      unitRate: 350,
      unitType: 'acre',
      unitTypeTe: 'ఎకరం',
      selected: true,
    },
    {
      id: 'jcb',
      name: 'JCB Land Levelling (భూమి చదును)',
      nameTe: 'JCB (భూమి చదును)',
      icon: '🚧',
      unitRate: 1800,
      unitType: 'hour',
      unitTypeTe: 'గంట',
      selected: false,
    },
    {
      id: 'irrigation',
      name: 'Irrigation Pump Service (ఇరిగేషన్)',
      nameTe: 'ఇరిగేషన్ (మోటార్ సర్వీస్)',
      icon: '💧',
      unitRate: 500,
      unitType: 'hour',
      unitTypeTe: 'గంట',
      selected: false,
    },
  ]);

  const toggleService = (id: string) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const activeServices = services.filter(s => s.selected);
  const totalAmount = activeServices.reduce((acc, s) => {
    const qty = s.unitType === 'acre' ? acres : 1;
    return acc + Math.round(s.unitRate * qty);
  }, 0);

  const handleNext = () => {
    onConfirmServices(activeServices, totalAmount);
    onNavigate('booking_summary');
  };

  return (
    <div className="screen-content service-selection-screen">
      {/* Selected Crop Summary Card (Image 2 Frame 3) */}
      <div className="chosen-crop-banner">
        <div className="crop-banner-left">
          <span className="banner-crop-icon">{selectedCrop.icon}</span>
          <div>
            <h4 className="banner-crop-name">{isTe ? selectedCrop.nameTe : selectedCrop.name}</h4>
            <p className="banner-crop-acres">{acres} {isTe ? 'ఎకరాలు' : 'Acres'}</p>
          </div>
        </div>
        <button
          type="button"
          className="change-crop-btn"
          onClick={() => onNavigate('crop_selection')}
        >
          {isTe ? 'మార్చండి' : 'Change'}
        </button>
      </div>

      {/* Available Services Section (Image 2 Frame 3) */}
      <div className="section-title-row">
        <h3 className="section-title-text">{isTe ? 'అందుబాటులో ఉన్న సేవలు' : 'Available Services'}</h3>
      </div>

      <div className="service-selection-list">
        {services.map(service => {
          const isSelected = service.selected;
          const cost = Math.round(service.unitRate * (service.unitType === 'acre' ? acres : 1));

          return (
            <div
              key={service.id}
              className={`service-select-row ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleService(service.id)}
            >
              <div className="service-row-left">
                <span className="service-glyph-icon">{service.icon}</span>
                <div className="service-row-info">
                  <h4 className="service-row-name">{isTe ? service.nameTe : service.name}</h4>
                  <div className="service-rate-label">
                    ₹{service.unitRate} / {isTe ? service.unitTypeTe : service.unitType}
                  </div>
                </div>
              </div>

              <div className="service-row-right">
                <div className="service-row-cost">₹{cost.toLocaleString('en-IN')}</div>
                <button
                  type="button"
                  className={`service-toggle-circle ${isSelected ? 'checked' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    toggleService(service.id);
                  }}
                >
                  {isSelected ? '✓' : '+'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Running Total Bar */}
      <div className="selection-total-strip">
        <div className="total-label-col">
          <span>{isTe ? 'ఎంపిక చేసిన సేవలు:' : 'Selected Services:'}</span>
          <strong>{activeServices.length} {isTe ? 'సేవలు' : 'items'}</strong>
        </div>
        <div className="total-amount-col">
          <span className="total-caption">{isTe ? 'మొత్తం:' : 'Total:'}</span>
          <span className="total-figure">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Sticky Bottom Next Button (Image 2 Frame 3: "తరువాత") */}
      <div className="sticky-bottom-action-bar">
        <button
          type="button"
          className="bottom-primary-action-btn"
          disabled={activeServices.length === 0}
          onClick={handleNext}
        >
          {isTe ? 'తరువాత (Next Step) →' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
};
