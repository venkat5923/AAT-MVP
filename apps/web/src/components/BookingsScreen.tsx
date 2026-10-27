import React, { useState } from 'react';
import { Language, ScreenType, BookingRecord } from '../types';

interface BookingsScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  bookings: BookingRecord[];
  onSelectBookingForTracking: (booking: BookingRecord) => void;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  lang,
  onNavigate,
  bookings,
  onSelectBookingForTracking,
}) => {
  const isTe = lang === 'te';
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'upcoming' | 'completed'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<BookingRecord | null>(null);

  const tabs = [
    { id: 'all' as const, label: isTe ? 'అన్నీ' : 'All' },
    { id: 'ongoing' as const, label: isTe ? 'మార్గంలో' : 'Ongoing' },
    { id: 'upcoming' as const, label: isTe ? 'పెండింగ్' : 'Upcoming' },
    { id: 'completed' as const, label: isTe ? 'పూర్తయినవి' : 'Completed' },
  ];

  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'ongoing') return b.status === 'ONGOING';
    if (activeFilter === 'upcoming') return b.status === 'PENDING' || b.status === 'CONFIRMED';
    if (activeFilter === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  const getStatusBadge = (status: BookingRecord['status'], statusTe?: string) => {
    switch (status) {
      case 'ONGOING':
        return <span className="status-badge ongoing">{statusTe || (isTe ? 'ప్రోగ్రెస్‌లో' : 'Ongoing')}</span>;
      case 'CONFIRMED':
        return <span className="status-badge confirmed">{isTe ? 'ఖరారైంది' : 'Confirmed'}</span>;
      case 'PENDING':
        return <span className="status-badge pending">{isTe ? 'పెండింగ్' : 'Pending'}</span>;
      case 'COMPLETED':
        return <span className="status-badge completed">{isTe ? 'పూర్తయింది' : 'Completed'}</span>;
      case 'CANCELLED':
        return <span className="status-badge cancelled">{isTe ? 'రద్దయింది' : 'Cancelled'}</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getTypeIcon = (type: BookingRecord['type']) => {
    switch (type) {
      case 'drone':
        return '🚁';
      case 'tractor':
        return '🚜';
      case 'machine':
        return '⚙️';
      case 'drip':
        return '💧';
      default:
        return '🌾';
    }
  };

  return (
    <div className="screen-content bookings-screen">
      {/* Sub-Tabs (Image 1 Frame 6 & Image 2 Frame 7) */}
      <div className="category-pills-scroll">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`category-pill ${activeFilter === tab.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="bookings-cards-col">
        {filteredBookings.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">📋</span>
            <h4>{isTe ? 'బుకింగ్‌లు ఏవీ లేవు' : 'No Bookings Found'}</h4>
            <p>{isTe ? 'మీరు ఈ విభాగంలో ఇంకా ఎటువంటి సేవలను బుక్ చేయలేదు' : 'No bookings in this filter category yet.'}</p>
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => onNavigate('home')}
            >
              {isTe ? 'సేవలను బుక్ చేయండి' : 'Book Services Now'}
            </button>
          </div>
        ) : (
          filteredBookings.map(b => (
            <div key={b.id} className="booking-order-card">
              <div className="booking-card-top-row">
                <div className="type-badge-combo">
                  <span className="type-emoji">{getTypeIcon(b.type)}</span>
                  <span className="type-text-tag">{b.type.toUpperCase()}</span>
                </div>
                {getStatusBadge(b.status, b.statusTe)}
              </div>

              <div className="booking-card-body">
                <h4 className="booking-title">{isTe ? b.titleTe || b.title : b.title}</h4>
                <p className="booking-details-line">{isTe ? b.detailsTe || b.details : b.details}</p>
                <div className="booking-meta-row">
                  <span className="booking-datetime">📅 {b.date} • {b.time}</span>
                  <span className="booking-price-figure">₹{b.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="booking-card-action-bar">
                {b.status === 'ONGOING' && (
                  <button
                    type="button"
                    className="track-live-btn"
                    onClick={() => {
                      onSelectBookingForTracking(b);
                      onNavigate('tracking');
                    }}
                  >
                    📍 {isTe ? 'లైవ్ ట్రాకింగ్ చూడండి' : 'Track Live on Map'}
                  </button>
                )}
                <button
                  type="button"
                  className="receipt-btn"
                  onClick={() => setSelectedReceipt(b)}
                >
                  📄 {isTe ? 'రసీదు' : 'Receipt'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-backdrop" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-dialog receipt-dialog" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <span className="receipt-stamp">PAID & VERIFIED</span>
              <h3>{isTe ? 'సేవ రసీదు' : 'Official Tax Receipt'}</h3>
              <p>Akanksha Agree Tech (AAT)</p>
            </div>
            <div className="receipt-body">
              <div className="receipt-row">
                <span>Order Reference:</span>
                <strong>#{selectedReceipt.id}</strong>
              </div>
              <div className="receipt-row">
                <span>Service:</span>
                <strong>{selectedReceipt.title}</strong>
              </div>
              <div className="receipt-row">
                <span>Date & Time:</span>
                <strong>{selectedReceipt.date} • {selectedReceipt.time}</strong>
              </div>
              <div className="receipt-row">
                <span>Total Paid:</span>
                <strong className="receipt-total-highlight">₹{selectedReceipt.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="receipt-row">
                <span>Status:</span>
                <strong>{selectedReceipt.status}</strong>
              </div>
            </div>
            <div className="receipt-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setSelectedReceipt(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
