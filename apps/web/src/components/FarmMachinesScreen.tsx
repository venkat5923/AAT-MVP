import React, { useState } from 'react';
import { Language, MachineItem, ScreenType } from '../types';
import { MACHINES_DATA } from '../data/mockData';

interface FarmMachinesScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  onSelectMachine: (machine: MachineItem) => void;
  onShowToast: (msg: string) => void;
}

export const FarmMachinesScreen: React.FC<FarmMachinesScreenProps> = ({
  lang,
  onNavigate: _onNavigate,
  onSelectMachine,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: isTe ? 'అన్నీ' : 'All', icon: '⚙️' },
    { id: 'Tillage', label: isTe ? 'దుక్కి యంత్రాలు' : 'Tillage', icon: '🌱' },
    { id: 'Planting', label: isTe ? 'నాట్లు & విత్తనాలు' : 'Planting', icon: '🌾' },
    { id: 'Harvesting', label: isTe ? 'కోత యంత్రాలు' : 'Harvesting', icon: '🚜' },
    { id: 'Processing', label: isTe ? 'ప్రాసెసింగ్' : 'Processing', icon: '🏭' },
    { id: 'Earth Moving', label: isTe ? 'జేసీబీ / భూమి చదును' : 'Earth Moving', icon: '🚧' },
  ];

  const filteredMachines =
    activeCategory === 'all'
      ? MACHINES_DATA
      : MACHINES_DATA.filter(m => m.category === activeCategory);

  const handleHire = (machine: MachineItem) => {
    onSelectMachine(machine);
    onShowToast(isTe ? `${machine.nameTe} బుకింగ్‌కు ఎంపికైంది!` : `${machine.name} selected for hire!`);
  };

  return (
    <div className="screen-content machines-screen">
      {/* Visual Header Banner (Image 1 Frame 5) */}
      <div className="category-hero-card machines-hero">
        <div className="category-hero-text">
          <span className="hero-tag-badge">Heavy Duty Agricultural Machinery</span>
          <h2>{isTe ? 'అద్దెకు అందుబాటులో ఉన్న వ్యవసాయ యంత్రాలు' : 'All Farming Machines Available for Hire'}</h2>
          <p>{isTe ? 'రొటవేటర్, హార్వెస్టర్, థ్రెషర్, జేసీబీ మరియు అధునాతన యంత్రాలు' : 'Heavy equipment on-demand. Boost turnaround time and reduce manual labor'}</p>
        </div>
        <div className="category-hero-icon">⚙️🚜</div>
      </div>

      {/* Machine Category Pills */}
      <div className="category-pills-scroll">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Popular Machines List */}
      <div className="section-title-row">
        <h3 className="section-title-text">{isTe ? 'ప్రజాదరణ పొందిన యంత్రాలు' : 'Popular Machines'}</h3>
        <span className="section-view-all">({filteredMachines.length} {isTe ? 'యంత్రాలు' : 'machines'})</span>
      </div>

      <div className="machines-grid-list">
        {filteredMachines.map(machine => (
          <div key={machine.id} className="machine-item-card">
            <div className="machine-icon-block">
              <span className="machine-glyph">{machine.icon}</span>
              <span className="machine-cat-badge">{machine.category}</span>
            </div>

            <div className="machine-body-block">
              <div className="machine-title-row">
                <h4 className="machine-name">{isTe ? machine.nameTe : machine.name}</h4>
                <span className="machine-rating">★ {machine.rating}</span>
              </div>
              <p className="machine-specs-text">{machine.specs}</p>

              <div className="machine-hire-action-row">
                <div className="machine-price-tag">
                  <span className="cur-sym">₹</span>
                  <span className="price-num">{machine.ratePerHour.toLocaleString('en-IN')}</span>
                  <span className="unit-label">/ {isTe ? machine.unitLabelTe : machine.unitLabel}</span>
                </div>
                <button
                  type="button"
                  className="hire-machine-btn"
                  onClick={() => handleHire(machine)}
                >
                  {isTe ? 'అద్దెకు తీసుకోండి' : 'Hire Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
