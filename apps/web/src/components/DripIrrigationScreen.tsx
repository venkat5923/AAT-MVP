import React, { useState } from 'react';
import { Language, ProductItem, CartItem } from '../types';
import { DRIP_PRODUCTS_DATA } from '../data/mockData';

interface DripIrrigationScreenProps {
  lang: Language;
  onAddToCart: (item: CartItem) => void;
  onBack: () => void;
  onShowToast: (msg: string) => void;
}

export const DripIrrigationScreen: React.FC<DripIrrigationScreenProps> = ({
  lang,
  onAddToCart,
  onBack: _onBack,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showConsultModal, setShowConsultModal] = useState<boolean>(false);
  const [consultAcres, setConsultAcres] = useState<string>('5');
  const [consultCrop, setConsultCrop] = useState<string>('Chilli / Mirchi');

  const categories = [
    { id: 'all', label: isTe ? 'అన్నీ' : 'All', icon: '💧' },
    { id: 'Drip Systems', label: isTe ? 'డ్రిప్ సిస్టమ్స్' : 'Drip Systems', icon: '🚰' },
    { id: 'Filters', label: isTe ? 'ఫిల్టర్లు' : 'Filters', icon: '🔘' },
    { id: 'Valves', label: isTe ? 'వాల్వ్‌లు' : 'Valves', icon: '🔧' },
    { id: 'Pipes & Fittings', label: isTe ? 'పైపులు' : 'Pipes & Fittings', icon: '🔩' },
    { id: 'Fertilizer Injectors', label: isTe ? 'ఇంజెక్టర్లు' : 'Fertilizer Injectors', icon: '🧪' },
    { id: 'Controllers', label: isTe ? 'కంట్రోలర్లు' : 'Controllers', icon: '📟' },
  ];

  const filteredProducts =
    activeCategory === 'all'
      ? DRIP_PRODUCTS_DATA
      : DRIP_PRODUCTS_DATA.filter(p => p.category === activeCategory);

  const handleAdd = (prod: ProductItem) => {
    onAddToCart({
      id: prod.id,
      name: prod.name,
      nameTe: prod.nameTe,
      price: prod.price,
      unit: prod.unit,
      unitTe: prod.unitTe,
      quantity: 1,
      category: prod.category,
      imageIcon: prod.icon,
    });
    onShowToast(isTe ? `${prod.nameTe} కార్ట్‌కు జోడించబడింది!` : `${prod.name} added to cart!`);
  };

  return (
    <div className="screen-content drip-screen">
      {/* Visual Header Banner (Image 1 Frame 2) */}
      <div className="category-hero-card drip-hero">
        <div className="category-hero-text">
          <span className="hero-tag-badge">90% Govt. Subsidy Eligible</span>
          <h2>{isTe ? 'సమగ్ర డ్రిప్ ఇరిగేషన్ పరిష్కారాలు' : 'Complete Drip Irrigation Solutions'}</h2>
          <p>{isTe ? 'ప్రతి పొలానికి సరిపడే నాణ్యమైన సూక్ష్మ సేద్య పరికరాలు' : 'Designed for every farm. Save 60% water, increase yield by 35%'}</p>
          <button
            type="button"
            className="hero-consult-btn"
            onClick={() => setShowConsultModal(true)}
          >
            {isTe ? 'ఉచిత పొలం సర్వే కోరండి 📋' : 'Request Free Field Survey 📋'}
          </button>
        </div>
        <div className="category-hero-icon">💧🌱</div>
      </div>

      {/* Horizontal Category Carousel */}
      <div className="category-pills-scroll">
        {categories.map(c => (
          <button
            key={c.id}
            type="button"
            className={`category-pill ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Popular Products Header */}
      <div className="section-title-row">
        <h3 className="section-title-text">
          {isTe ? 'ప్రజాదరణ పొందిన ఉత్పత్తులు' : 'Popular Drip Products'}
        </h3>
        <span className="section-view-all">({filteredProducts.length} {isTe ? 'లభ్యత' : 'items'})</span>
      </div>

      {/* Products Grid */}
      <div className="products-grid-list">
        {filteredProducts.map(prod => (
          <div key={prod.id} className="product-card">
            <div className="product-icon-wrap">
              <span className="prod-emoji-icon">{prod.icon}</span>
              <span className="prod-rating-badge">★ {prod.rating}</span>
            </div>
            <div className="product-details">
              <h4 className="product-title">{isTe ? prod.nameTe : prod.name}</h4>
              <p className="product-desc">{prod.description}</p>
              <div className="product-price-row">
                <div className="price-tag">
                  <span className="currency-symbol">₹</span>
                  <span className="price-val">{prod.price.toLocaleString('en-IN')}</span>
                  <span className="price-unit">/ {isTe ? prod.unitTe : prod.unit}</span>
                </div>
                <button
                  type="button"
                  className="add-cart-btn"
                  onClick={() => handleAdd(prod)}
                >
                  {isTe ? '+ జోడించు' : '+ Add'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Free Field Survey Modal */}
      {showConsultModal && (
        <div className="modal-backdrop" onClick={() => setShowConsultModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isTe ? 'ఉచిత డ్రిప్ ఇరిగేషన్ సర్వే' : 'Request Drip Survey & Subsidy'}</h3>
              <button type="button" className="close-btn" onClick={() => setShowConsultModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-intro">
                {isTe
                  ? 'మా నిపుణుల ఇంజనీర్ మీ పొలాన్ని సందర్శించి ఉచితంగా డిజైన్ మరియు ప్రభుత్వ సబ్సిడీ అంచనాను అందిస్తారు.'
                  : 'Our certified agri-irrigation engineer will inspect your borewell flow, soil texture, and deliver tailored layout.'}
              </p>
              <div className="form-group">
                <label>{isTe ? 'పంట రకం' : 'Crop'}</label>
                <select value={consultCrop} onChange={e => setConsultCrop(e.target.value)}>
                  <option value="Chilli / Mirchi">Chilli / Mirchi (మిర్చి)</option>
                  <option value="Cotton">Cotton (పత్తి)</option>
                  <option value="Horticulture / Mango">Mango / Citrus Orchard (మామిడి/నిమ్మ)</option>
                  <option value="Banana">Banana Plantation (అరటి)</option>
                  <option value="Vegetables">Vegetables / Polyhouse (కూరగాయలు)</option>
                </select>
              </div>
              <div className="form-group">
                <label>{isTe ? 'విస్తీర్ణం (ఎకరాలు)' : 'Farm Area (Acres)'}</label>
                <input
                  type="number"
                  value={consultAcres}
                  onChange={e => setConsultAcres(e.target.value)}
                  min="1"
                  max="50"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => {
                  setShowConsultModal(false);
                  onShowToast(isTe ? 'సర్వే అభ్యర్థన విజయవంతంగా నమోదైంది! మా ఇంజనీర్ మిమ్మల్ని సంప్రదిస్తారు.' : 'Survey request registered! Our engineer will call you shortly.');
                }}
              >
                {isTe ? 'అభ్యర్థన పంపండి' : 'Confirm Survey Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
