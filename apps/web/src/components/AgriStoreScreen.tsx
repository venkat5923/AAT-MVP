import React, { useState } from 'react';
import { Language, ProductItem, CartItem } from '../types';
import { AGRI_STORE_DATA } from '../data/mockData';

interface AgriStoreScreenProps {
  lang: Language;
  onAddToCart: (item: CartItem) => void;
  onShowToast: (msg: string) => void;
  onOpenCart: () => void;
}

export const AgriStoreScreen: React.FC<AgriStoreScreenProps> = ({
  lang,
  onAddToCart,
  onShowToast,
  onOpenCart,
}) => {
  const isTe = lang === 'te';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: isTe ? 'అన్నీ' : 'All', icon: '🛒' },
    { id: 'Seeds', label: isTe ? 'విత్తనాలు' : 'Seeds', icon: '🌾' },
    { id: 'Fertilizers', label: isTe ? 'ఎరువులు' : 'Fertilizers', icon: '📦' },
    { id: 'Pesticides', label: isTe ? 'పురుగు మందులు' : 'Pesticides', icon: '🧪' },
    { id: 'Micronutrients', label: isTe ? 'సూక్ష్మ పోషకాలు' : 'Micronutrients', icon: '⚡' },
    { id: 'Tools', label: isTe ? 'పనిముట్లు' : 'Tools', icon: '🎒' },
  ];

  const filteredProducts = AGRI_STORE_DATA.filter(prod => {
    if (activeCategory !== 'all' && prod.category !== activeCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        prod.name.toLowerCase().includes(q) ||
        prod.nameTe.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
    <div className="screen-content store-screen">
      {/* Search Input Bar (Image 1 Frame 7) */}
      <div className="crop-search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={isTe ? 'ఉత్పత్తుల కోసం వెతకండి (విత్తనాలు, యూరియా, మందులు)...' : 'Search products (Seeds, DAP, Bio-Pesticide)...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Icons Carousel (Image 1 Frame 7) */}
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

      {/* Best Selling Products Header */}
      <div className="section-title-row">
        <h3 className="section-title-text">
          {isTe ? 'అత్యధికంగా అమ్ముడవుతున్న ఉత్పత్తులు' : 'Best Selling Products'}
        </h3>
        <span className="section-view-all">({filteredProducts.length} {isTe ? 'లభ్యత' : 'items'})</span>
      </div>

      {/* Product List Cards (Image 1 Frame 7) */}
      <div className="store-products-list">
        {filteredProducts.map(prod => (
          <div key={prod.id} className="store-product-card">
            <div className="store-card-icon-area">
              <span className="store-item-emoji">{prod.icon}</span>
              <span className="store-rating-badge">★ {prod.rating}</span>
            </div>

            <div className="store-card-info-area">
              <span className="store-cat-tag">{prod.category}</span>
              <h4 className="store-prod-title">{isTe ? prod.nameTe : prod.name}</h4>
              <p className="store-prod-desc">{prod.description}</p>
              
              <div className="store-card-footer">
                <div className="store-price-display">
                  <span className="cur-sym">₹</span>
                  <span className="price-val">{prod.price.toLocaleString('en-IN')}</span>
                  <span className="unit-label">/ {isTe ? prod.unitTe : prod.unit}</span>
                </div>
                <button
                  type="button"
                  className="store-add-btn"
                  onClick={() => handleAdd(prod)}
                >
                  {isTe ? '+ జోడించు' : '+ Add'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating View Cart Trigger */}
      <div className="floating-cart-bar">
        <button
          type="button"
          className="floating-cart-btn"
          onClick={onOpenCart}
        >
          <span>🛒 {isTe ? 'కార్ట్‌ను చూడండి & చెల్లించండి' : 'View Cart & Checkout'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
