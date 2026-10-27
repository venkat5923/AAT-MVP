import React, { useState } from 'react';
import { Language, ScreenType, CropItem } from '../types';
import { CROPS_DATA } from '../data/mockData';

interface CropSelectionScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  onSelectCrop: (crop: CropItem, acres: number) => void;
  selectedCropId?: string;
  initialAcres?: number;
}

export const CropSelectionScreen: React.FC<CropSelectionScreenProps> = ({
  lang,
  onNavigate,
  onSelectCrop,
  selectedCropId = 'paddy',
  initialAcres = 5.5,
}) => {
  const isTe = lang === 'te';
  const [chosenCropId, setChosenCropId] = useState<string>(selectedCropId);
  const [acres, setAcres] = useState<number>(initialAcres);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCrops = CROPS_DATA.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.nameTe.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProceed = () => {
    const crop = CROPS_DATA.find(c => c.id === chosenCropId) || CROPS_DATA[0];
    onSelectCrop(crop, acres);
    onNavigate('service_selection');
  };

  return (
    <div className="screen-content crop-selection-screen">
      {/* Search Input (Image 2 Frame 2) */}
      <div className="crop-search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={isTe ? 'పంట కోసం వెతకండి...' : 'Search crop (e.g. Paddy, Cotton)...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Acreage Selector */}
      <div className="acres-counter-card">
        <label className="acres-label">{isTe ? 'పొలం విస్తీర్ణం (ఎకరాలు)' : 'Farm Size (Acres)'}</label>
        <div className="acres-controls">
          <button
            type="button"
            className="acres-btn minus"
            onClick={() => setAcres(prev => Math.max(0.5, prev - 0.5))}
          >
            -
          </button>
          <span className="acres-value-display">{acres.toFixed(1)} {isTe ? 'ఎకరాలు' : 'Acres'}</span>
          <button
            type="button"
            className="acres-btn plus"
            onClick={() => setAcres(prev => prev + 0.5)}
          >
            +
          </button>
        </div>
      </div>

      {/* Common Crops Grid (Image 2 Frame 2) */}
      <div className="section-title-row">
        <h3 className="section-title-text">{isTe ? 'సాధారణ పంటలు' : 'Common Crops'}</h3>
      </div>

      <div className="crops-grid-container">
        {filteredCrops.map(crop => {
          const isSelected = chosenCropId === crop.id;
          return (
            <button
              key={crop.id}
              type="button"
              className={`crop-card-choice ${isSelected ? 'selected' : ''}`}
              onClick={() => setChosenCropId(crop.id)}
            >
              <span className="crop-emoji-icon">{crop.icon}</span>
              <span className="crop-name-label">{isTe ? crop.nameTe : crop.name}</span>
              <span className="crop-season-sub">{isTe ? crop.seasonTe : crop.season}</span>
              {isSelected && <span className="crop-checked-pill">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Sticky Bottom Next Button (Image 2 Frame 2: "తరువాత") */}
      <div className="sticky-bottom-action-bar">
        <button
          type="button"
          className="bottom-primary-action-btn"
          onClick={handleProceed}
        >
          {isTe ? 'తరువాత (Next) →' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
};
