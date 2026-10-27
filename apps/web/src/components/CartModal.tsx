import React from 'react';
import { Language, CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  lang: Language;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  onCheckout: (total: number) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  lang,
  onUpdateQuantity,
  onClearCart,
  onCheckout,
}) => {
  if (!isOpen) return null;
  const isTe = lang === 'te';

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <span>🛒</span>
            <h3>{isTe ? 'మీ షాపింగ్ కార్ట్' : 'Your Shopping Cart'}</h3>
            <span className="cart-count-badge">({items.length})</span>
            {items.length > 0 && (
              <button
                type="button"
                className="link-btn"
                onClick={onClearCart}
                style={{ marginLeft: '8px', fontSize: '0.72rem', color: '#dc2626' }}
              >
                {isTe ? 'ఖాళీ చేయండి' : 'Clear'}
              </button>
            )}
          </div>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items-scroll">
          {items.length === 0 ? (
            <div className="empty-cart-state">
              <span className="empty-cart-glyph">🛒</span>
              <h4>{isTe ? 'కార్ట్ ఖాళీగా ఉంది' : 'Your Cart is Empty'}</h4>
              <p>{isTe ? 'అగ్రి స్టోర్ నుండి విత్తనాలు మరియు ఎరువులను జోడించండి' : 'Browse Agri Store or Drip Irrigation to add farming essentials.'}</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item-row">
                <span className="cart-item-icon">{item.imageIcon}</span>
                <div className="cart-item-info">
                  <h4 className="cart-item-title">{isTe ? item.nameTe || item.name : item.name}</h4>
                  <div className="cart-item-rate">
                    ₹{item.price.toLocaleString('en-IN')} / {isTe ? item.unitTe || item.unit : item.unit}
                  </div>
                </div>

                <div className="cart-item-stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                  >
                    -
                  </button>
                  <span className="stepper-qty">{item.quantity}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-bill-breakdown">
              <div className="bill-row">
                <span>{isTe ? 'ఉత్పత్తుల మొత్తం' : 'Items Subtotal'}</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="bill-row">
                <span>{isTe ? 'డెలివరీ ఛార్జీ' : 'Field Delivery'}</span>
                <span>{deliveryFee === 0 ? <strong className="free-tag">{isTe ? 'ఉచితం (FREE)' : 'FREE'}</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="bill-row bill-grand-total">
                <strong>{isTe ? 'మొత్తం చెల్లించవలసినది' : 'Grand Total'}</strong>
                <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="cart-action-buttons">
              <button
                type="button"
                className="cart-checkout-btn"
                onClick={() => onCheckout(grandTotal)}
              >
                {isTe ? `ఆర్డర్ చేయండి (₹${grandTotal.toLocaleString('en-IN')}) →` : `Place Order (₹${grandTotal.toLocaleString('en-IN')}) →`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
