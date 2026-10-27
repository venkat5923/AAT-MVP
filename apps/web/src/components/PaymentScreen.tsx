import React, { useState } from 'react';
import { Language, ScreenType } from '../types';

interface PaymentScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  totalAmount: number;
  walletBalance: number;
  onCompletePayment: (paymentMethod: string, amount: number) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  lang,
  onNavigate,
  totalAmount,
  walletBalance,
  onCompletePayment,
}) => {
  const isTe = lang === 'te';
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cash'>('upi');
  const [upiId, setUpiId] = useState<string>('farmer.reddy@okaxis');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const paymentOptions = [
    {
      id: 'upi' as const,
      name: 'UPI (PhonePe, GPay, Paytm, BHIM)',
      nameTe: 'యూపీఐ (PhonePe / GPay / Paytm)',
      icon: '🟢',
      sub: 'Instant 0% convenience fee',
      subTe: 'తక్షణ చెల్లింపు • జీరో ఛార్జీలు',
    },
    {
      id: 'card' as const,
      name: 'Cards (RuPay / Debit / Credit)',
      nameTe: 'డెబిట్ / క్రెడిట్ కార్డు (RuPay, Visa, MC)',
      icon: '💳',
      sub: 'All major bank cards supported',
      subTe: 'అన్ని బ్యాంక్ కార్డులు అంగీకరించబడతాయి',
    },
    {
      id: 'netbanking' as const,
      name: 'Net Banking (SBI, Union, HDFC, ICICI)',
      nameTe: 'నెట్ బ్యాంకింగ్ (SBI, యూనియన్ బ్యాంక్, HDFC)',
      icon: '🏦',
      sub: 'Direct bank transfer',
      subTe: 'ప్రత్యక్ష బ్యాంక్ లావాదేవీ',
    },
    {
      id: 'wallet' as const,
      name: `Kisan Agri Wallet (Balance: ₹${walletBalance.toLocaleString('en-IN')})`,
      nameTe: `కిసాన్ అగ్రి వాలెట్ (నిల్వ: ₹${walletBalance.toLocaleString('en-IN')})`,
      icon: '👛',
      sub: walletBalance >= totalAmount ? 'Sufficient balance' : 'Insufficient balance (Top-up needed)',
      subTe: walletBalance >= totalAmount ? 'తగినంత నిల్వ ఉంది' : 'వాలెట్ రీఛార్జ్ అవసరం',
      disabled: walletBalance < totalAmount,
    },
    {
      id: 'cash' as const,
      name: 'Cash on Service / OTP Verification',
      nameTe: 'క్యాష్ ఆన్ సర్వీస్ (పని పూర్తయిన తర్వాత)',
      icon: '💵',
      sub: 'Pay provider directly after job completion',
      subTe: 'పని సంతృప్తికరంగా పూర్తయ్యాక చెల్లించండి',
    },
  ];

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onCompletePayment(selectedMethod, totalAmount);
      onNavigate('tracking');
    }, 1200);
  };

  return (
    <div className="screen-content payment-screen">
      {/* Total Amount Payable Banner (Image 2 Frame 5) */}
      <div className="payment-amount-card">
        <span className="pay-amount-label">{isTe ? 'మొత్తం చెల్లించవలసినది' : 'Total Amount Payable'}</span>
        <div className="pay-amount-value">
          <span className="cur-symbol">₹</span>
          <span className="amount-digit">{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <span className="pay-security-badge">🔒 {isTe ? '100% సురక్షిత చెల్లింపు గేట్‌వే' : '100% Secure Payment Guarantee'}</span>
      </div>

      {/* Payment Methods Section (Image 2 Frame 5) */}
      <div className="section-title-row">
        <h3 className="section-title-text">{isTe ? 'చెల్లింపు విధానం' : 'Select Payment Method'}</h3>
      </div>

      <div className="payment-methods-list">
        {paymentOptions.map(opt => {
          const isSelected = selectedMethod === opt.id;
          return (
            <div
              key={opt.id}
              className={`payment-option-row ${isSelected ? 'selected' : ''} ${opt.disabled ? 'disabled' : ''}`}
              onClick={() => !opt.disabled && setSelectedMethod(opt.id)}
            >
              <div className="pay-opt-icon">{opt.icon}</div>
              <div className="pay-opt-info">
                <h4 className="pay-opt-title">{isTe ? opt.nameTe : opt.name}</h4>
                <p className="pay-opt-sub">{isTe ? opt.subTe : opt.sub}</p>
              </div>
              <div className="pay-radio-circle">
                {isSelected && <div className="pay-radio-dot" />}
              </div>
            </div>
          );
        })}
      </div>

      {selectedMethod === 'upi' && (
        <div className="upi-input-card">
          <label className="upi-label">{isTe ? 'UPI ID నమోదు చేయండి' : 'Enter UPI ID / VPA'}</label>
          <div className="upi-input-group">
            <input
              type="text"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              className="styled-input-clean"
              placeholder="e.g. 9876543210@upi"
            />
            <span className="verified-upi-badge">✓ Verified</span>
          </div>
        </div>
      )}

      {/* Sticky Pay Button (Image 2 Frame 5: "₹3050 చెల్లించండి") */}
      <div className="sticky-bottom-action-bar">
        <button
          type="button"
          className="bottom-primary-action-btn pay-action-btn"
          disabled={isProcessing}
          onClick={handlePay}
        >
          {isProcessing ? (
            <span>⏳ {isTe ? 'చెల్లింపు ప్రాసెస్ అవుతోంది...' : 'Processing Secure Payment...'}</span>
          ) : (
            <span>
              🔒 {isTe ? `₹${totalAmount.toLocaleString('en-IN')} చెల్లించండి` : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
