import React, { useState } from 'react';
import { Language, ScreenType, TransactionRecord } from '../types';

interface WalletScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  balance: number;
  transactions: TransactionRecord[];
  onAddMoney: (amount: number) => void;
  onShowToast: (msg: string) => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  lang,
  onNavigate: _onNavigate,
  balance,
  transactions,
  onAddMoney,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<number>(1000);

  const presets = [500, 1000, 2000, 5000];

  const handleConfirmAdd = () => {
    if (customAmount <= 0) return;
    onAddMoney(customAmount);
    setShowAddModal(false);
    onShowToast(isTe ? `₹${customAmount.toLocaleString('en-IN')} వాలెట్‌కు విజయవంతంగా జోడించబడింది!` : `₹${customAmount.toLocaleString('en-IN')} added to wallet successfully!`);
  };

  return (
    <div className="screen-content wallet-screen">
      {/* Wallet Balance Hero Card (Image 1 Frame 9) */}
      <div className="wallet-card-hero">
        <div className="wallet-card-header">
          <span className="wallet-card-brand">Akanksha Agree Tech Kisan Wallet</span>
          <span className="wallet-chip">💳</span>
        </div>
        <div className="wallet-balance-row">
          <div className="balance-info-col">
            <span className="balance-label">{isTe ? 'మొత్తం నిల్వ' : 'Total Balance'}</span>
            <div className="balance-amount-display">
              <span className="cur-symbol">₹</span>
              <span className="balance-num">{balance.toLocaleString('en-IN')}.00</span>
            </div>
          </div>
          <button
            type="button"
            className="add-money-trigger-btn"
            onClick={() => setShowAddModal(true)}
          >
            + {isTe ? 'డబ్బులు జోడించండి' : 'Add Money'}
          </button>
        </div>
        <div className="wallet-card-footer">
          <span>Linked A/C: •••• 8912</span>
          <span>Fast Checkout Active</span>
        </div>
      </div>

      {/* Transactions Section (Image 1 Frame 9) */}
      <div className="section-title-row">
        <h3 className="section-title-text">{isTe ? 'ఇటీవలి లావాదేవీలు' : 'Recent Transactions'}</h3>
        <span className="section-view-all">{transactions.length} records</span>
      </div>

      <div className="transactions-list-col">
        {transactions.map(txn => {
          const isCredit = txn.type === 'credit';
          return (
            <div key={txn.id} className="transaction-row-item">
              <div className="txn-icon-block">
                <span className={`txn-direction-icon ${isCredit ? 'credit' : 'debit'}`}>
                  {isCredit ? '↙' : '↗'}
                </span>
              </div>
              <div className="txn-info-block">
                <h4 className="txn-title">{isTe ? txn.titleTe || txn.title : txn.title}</h4>
                <span className="txn-date-meta">{txn.date} • {txn.category}</span>
              </div>
              <div className={`txn-amount-block ${isCredit ? 'credit-text' : 'debit-text'}`}>
                {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Money Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog add-money-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isTe ? 'వాలెట్‌కు డబ్బులు జోడించండి' : 'Add Money to Wallet'}</h3>
              <button type="button" className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="amount-input-box">
                <span className="cur-lead">₹</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={e => setCustomAmount(Number(e.target.value))}
                  min="100"
                  max="100000"
                  className="big-amount-input"
                />
              </div>

              <div className="preset-amounts-row">
                {presets.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`preset-chip ${customAmount === p ? 'active' : ''}`}
                    onClick={() => setCustomAmount(p)}
                  >
                    +₹{p}
                  </button>
                ))}
              </div>

              <p className="add-money-helper">
                {isTe ? 'UPI, డెబిట్ కార్డు లేదా నెట్ బ్యాంకింగ్ ద్వారా తక్షణమే రీఛార్జ్ చేయండి.' : 'Instant top-up via UPI (PhonePe, GPay, Paytm) or RuPay Card.'}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleConfirmAdd}
              >
                {isTe ? `₹${customAmount.toLocaleString('en-IN')} జమ చేయండి` : `Proceed to Add ₹${customAmount.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
