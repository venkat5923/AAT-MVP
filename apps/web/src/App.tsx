import React, { useState, useEffect } from 'react';

// API Base URL
const API_BASE = '/api/v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'farmer' | 'provider' | 'operations' | 'compliance'>('farmer');
  const [districts, setDistricts] = useState<any[]>([]);
  
  interface Toast {
    id: string;
    type: 'info' | 'success' | 'danger';
    message: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Farmer State
  const [farmerFarms, setFarmerFarms] = useState<any[]>([
    {
      id: 'farm-guntur-paddy',
      farm_name: 'Guntur East Paddy Field',
      size_acres: 5.5,
      address: 'Pedakakani Mandal, Guntur Rural',
    },
    {
      id: 'farm-amaravati-cotton',
      farm_name: 'Amaravati Cotton Land',
      size_acres: 8.0,
      address: 'Thullur Mandal, Amaravati Area',
    },
  ]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-guntur-paddy');
  const [requestedDate, setRequestedDate] = useState<string>('2026-11-05');
  const [timeWindow, setTimeWindow] = useState<string>('08:00 - 12:00');
  const [estimatedUnits, setEstimatedUnits] = useState<number>(5.5);
  const [implementRequired, setImplementRequired] = useState<string>('Rotavator');
  const [soilCondition, setSoilCondition] = useState<string>('Wet Clay / Paddy');
  const [farmerRequests, setFarmerRequests] = useState<any[]>([]);
  const [activeFarmerRequest, setActiveFarmerRequest] = useState<any>(null);
  const [approvedQuotations, setApprovedQuotations] = useState<any[]>([]);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [isFarmerSubmitting, setIsFarmerSubmitting] = useState<boolean>(false);

  // Provider State
  const [providerInvitations, setProviderInvitations] = useState<any[]>([]);
  const [quoteQuantity, setQuoteQuantity] = useState<number>(5.5);
  const [quoteUnitRate, setQuoteUnitRate] = useState<number>(850);
  const [quoteMobilization, setQuoteMobilization] = useState<number>(500);
  const [quoteMaterials, setQuoteMaterials] = useState<number>(0);
  const [providerNote, setProviderNote] = useState<string>('45 HP Tractor with 42-blade heavy rotavator');
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const [completionOtpInput, setCompletionOtpInput] = useState<string>('');

  // Operations State
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [staffQueue, setStaffQueue] = useState<any[]>([]);
  const [reviewNote, setReviewNote] = useState<string>('Rate verified within standard Guntur benchmark.');

  // Pre-configured Dev Auth Tokens for each persona
  const [authTokens, setAuthTokens] = useState<Record<string, string>>({});

  // 1. Initial Load & Auth Simulation
  useEffect(() => {
    async function init() {
      try {
        // Authenticate Farmer (Ramesh Reddy)
        const farmerAuth = await fetch(`${API_BASE}/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '+919876543210', otp: '123456', role: 'farmer' }),
        }).then(res => res.json());

        // Authenticate Provider (Siva Kumar)
        const provAuth = await fetch(`${API_BASE}/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '+919876543211', otp: '123456', role: 'provider' }),
        }).then(res => res.json());

        // Authenticate Staff
        const staffAuth = await fetch(`${API_BASE}/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '+919876543213', otp: '123456', role: 'staff' }),
        }).then(res => res.json());

        const tokens = {
          farmer: farmerAuth.data?.token,
          provider: provAuth.data?.token,
          staff: staffAuth.data?.token,
        };
        setAuthTokens(tokens);

        // Fetch Districts
        const distRes = await fetch(`${API_BASE}/districts`).then(r => r.json());
        if (distRes.data) setDistricts(distRes.data);

        // Fetch Farmer's Farms & Requests
        if (tokens.farmer) {
          const farmsRes = await fetch(`${API_BASE}/farms`, {
            headers: { Authorization: `Bearer ${tokens.farmer}` },
          }).then(r => r.json());
          if (farmsRes.data && farmsRes.data.length > 0) {
            setFarmerFarms(farmsRes.data);
            setSelectedFarmId(farmsRes.data[0].id);
          }

          const reqsRes = await fetch(`${API_BASE}/requests`, {
            headers: { Authorization: `Bearer ${tokens.farmer}` },
          }).then(r => r.json());
          if (reqsRes.data) setFarmerRequests(reqsRes.data);
        }

        // Fetch Provider's Invitations
        if (tokens.provider) {
          const invsRes = await fetch(`${API_BASE}/provider/invitations`, {
            headers: { Authorization: `Bearer ${tokens.provider}` },
          }).then(r => r.json());
          if (invsRes.data) setProviderInvitations(invsRes.data);
        }

        // Fetch Staff Pending Reviews
        if (tokens.staff) {
          const revRes = await fetch(`${API_BASE}/operations/price-reviews?status=ALL`, {
            headers: { Authorization: `Bearer ${tokens.staff}` },
          }).then(r => r.json());
          if (revRes.data) setPendingReviews(revRes.data);

          const qRes = await fetch(`${API_BASE}/operations/staff-queue`, {
            headers: { Authorization: `Bearer ${tokens.staff}` },
          }).then(r => r.json());
          if (qRes.data) setStaffQueue(qRes.data);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  // Show toast notification with multi-message stacking support
  const showAlert = (message: string, type: 'info' | 'success' | 'danger' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-3), { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  // Farmer: Submit Tractor Request
  const handleFarmerSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId) return;
    try {
      setIsFarmerSubmitting(true);
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.farmer}`,
        },
        body: JSON.stringify({
          farmId: selectedFarmId,
          serviceId: 'srv-tractor',
          scheduledDate: requestedDate,
          timeWindow,
          estimatedUnits,
          unitType: 'acre',
          implementRequired,
          soilCondition,
          notes: `Requested ${implementRequired} for ${estimatedUnits} acres.`,
        }),
      }).then(r => r.json());

      if (res.success) {
        showAlert(`Tractor request #${res.data.id} submitted! Matching algorithm triggered.`, 'success');
        setActiveFarmerRequest(res.data);

        // Refresh farmer requests
        const reqs = await fetch(`${API_BASE}/requests`, {
          headers: { Authorization: `Bearer ${authTokens.farmer}` },
        }).then(r => r.json());
        setFarmerRequests(reqs.data || []);

        // Refresh provider invitations
        const invs = await fetch(`${API_BASE}/provider/invitations`, {
          headers: { Authorization: `Bearer ${authTokens.provider}` },
        }).then(r => r.json());
        setProviderInvitations(invs.data || []);
      } else {
        showAlert(res.error?.message || 'Failed to submit request', 'danger');
      }
    } catch (err: any) {
      showAlert(err.message, 'danger');
    } finally {
      setIsFarmerSubmitting(false);
    }
  };

  // Farmer: Inspect Approved Quotations for a Request
  const handleViewQuotations = async (requestId: string) => {
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/quotations`, {
        headers: { Authorization: `Bearer ${authTokens.farmer}` },
      }).then(r => r.json());
      setApprovedQuotations(res.data || []);
      if (!res.data || res.data.length === 0) {
        showAlert('No approved quotations yet. Operations review may be in progress.', 'info');
      }
    } catch (err: any) {
      showAlert(err.message, 'danger');
    }
  };

  // Farmer: Select Quotation & Confirm Booking
  const handleSelectQuotation = async (quotationId: string) => {
    try {
      const res = await fetch(`${API_BASE}/quotations/${quotationId}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.farmer}`,
        },
        body: JSON.stringify({ paymentCondition: 'CASH' }),
      }).then(r => r.json());

      if (res.success) {
        setActiveBooking(res.data);
        showAlert(`Booking #${res.data.bookingId} confirmed! Completion OTP generated.`, 'success');
        // Refresh quotations
        if (activeFarmerRequest) {
          handleViewQuotations(activeFarmerRequest.id);
        }
      } else {
        showAlert(res.error?.message || 'Quotation selection failed', 'danger');
      }
    } catch (err: any) {
      showAlert(err.message, 'danger');
    }
  };

  // Provider: Submit Quotation
  const handleProviderSubmitQuotation = async (invitationId: string) => {
    try {
      const subtotal = quoteQuantity * quoteUnitRate;
      const total = subtotal + quoteMobilization + quoteMaterials;

      const res = await fetch(`${API_BASE}/provider/invitations/${invitationId}/quotation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.provider}`,
        },
        body: JSON.stringify({
          lines: [
            {
              unit: 'acre',
              quantity: quoteQuantity,
              unitRate: quoteUnitRate,
              mobilizationCharge: quoteMobilization,
              materialCharge: quoteMaterials,
            },
          ],
          providerNote,
          validHours: 24,
        }),
      }).then(r => r.json());

      if (res.success) {
        showAlert(`Quotation submitted (Total: ₹${total}). Pending Operations clearance.`, 'success');
        setSelectedInvitationId('');
        // Refresh provider invitations
        const invs = await fetch(`${API_BASE}/provider/invitations`, {
          headers: { Authorization: `Bearer ${authTokens.provider}` },
        }).then(r => r.json());
        setProviderInvitations(invs.data || []);

        // Refresh staff pending reviews
        const revs = await fetch(`${API_BASE}/operations/price-reviews?status=ALL`, {
          headers: { Authorization: `Bearer ${authTokens.staff}` },
        }).then(r => r.json());
        setPendingReviews(revs.data || []);
      } else {
        showAlert(res.error?.message || 'Submission failed', 'danger');
      }
    } catch (err: any) {
      showAlert(err.message, 'danger');
    }
  };

  // Operations: Approve or Reject Quotation
  const handleReviewQuotation = async (quotationId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE}/operations/quotations/${quotationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.staff}`,
        },
        body: JSON.stringify({ decision, reason: reviewNote }),
      }).then(r => r.json());

      if (res.success) {
        showAlert(`Quotation ${decision.toLowerCase()}! Audited under correlation ID.`, 'success');
        // Refresh pending reviews
        const revs = await fetch(`${API_BASE}/operations/price-reviews?status=ALL`, {
          headers: { Authorization: `Bearer ${authTokens.staff}` },
        }).then(r => r.json());
        setPendingReviews(revs.data || []);
      } else {
        showAlert(res.error?.message || 'Review failed', 'danger');
      }
    } catch (err: any) {
      showAlert(err.message, 'danger');
    }
  };

  // Provider: Trip State Transition
  const handleTripUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/trip-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.provider}`,
        },
        body: JSON.stringify({ newStatus, note: `Status updated to ${newStatus}` }),
      }).then(r => r.json());

      if (res.success) {
        showAlert(`Trip status transitioned to: ${newStatus}`, 'info');
        if (activeBooking && activeBooking.bookingId === bookingId) {
          setActiveBooking({ ...activeBooking, status: newStatus });
        }
      } else {
        showAlert(res.error?.message || 'Transition failed', 'danger');
      }
    } catch (err: any) {
      showAlert(err.message, 'danger');
    }
  };

  // Provider: Verify Farmer Completion OTP
  const handleVerifyCompletionOtp = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/verify-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.provider}`,
        },
        body: JSON.stringify({ completionOtp: completionOtpInput }),
      }).then(r => r.json());

      if (res.success) {
        showAlert('Completion OTP verified successfully! Job marked CASH_CLOSED.', 'success');
        setCompletionOtpInput('');
        if (activeBooking && activeBooking.bookingId === bookingId) {
          setActiveBooking({ ...activeBooking, status: res.data.finalStatus });
        }
      } else {
        showAlert(res.error?.message || 'Verification failed', 'danger');
      }
    } catch (err: any) {
      showAlert(err.message, 'danger');
    }
  };

  return (
    <div>
      {/* Platform Header */}
      <header className="aat-header">
        <a href="#home" className="aat-brand" onClick={() => setActiveTab('compliance')}>
          <div className="aat-logo-mark">AAT</div>
          <div>
            <div className="aat-title">Akanksha Agree Tech</div>
            <div className="aat-subtitle">Tractor Mechanization Marketplace (AP & TG)</div>
          </div>
        </a>

        {/* Persona Switcher */}
        <nav className="role-nav">
          <button
            className={`role-nav-btn ${activeTab === 'farmer' ? 'active' : ''}`}
            onClick={() => setActiveTab('farmer')}
          >
            Farmer Portal
          </button>
          <button
            className={`role-nav-btn ${activeTab === 'provider' ? 'active' : ''}`}
            onClick={() => setActiveTab('provider')}
          >
            Provider Portal
          </button>
          <button
            className={`role-nav-btn ${activeTab === 'operations' ? 'active' : ''}`}
            onClick={() => setActiveTab('operations')}
          >
            Operations Admin
          </button>
          <button
            className={`role-nav-btn ${activeTab === 'compliance' ? 'active' : ''}`}
            onClick={() => setActiveTab('compliance')}
          >
            Districts & Compliance
          </button>
        </nav>
      </header>

      {/* Toast Notification Container with multi-alert stacking */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`alert alert-${t.type} toast-item`}>
            <span>{t.message}</span>
            <button
              className="toast-close-btn"
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="app-container">

        {/* 1. FARMER PORTAL */}
        {activeTab === 'farmer' && (
          <div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Book Tractor Service</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Logged in as: <strong>Ramesh Reddy</strong> (+91 98765 43210) &bull; Guntur District
                  </p>
                </div>
                <span className="badge badge-info">Tractor Vertical Slice</span>
              </div>

              {/* Step Progression Visualizer */}
              <div className="mobile-step-indicator">Step 2 of 4 &bull; Equipment & Farm Details</div>
              <div className="stepper">
                <div className="step-item completed">
                  <div className="step-number">1</div>
                  <div className="step-label">Select Farm</div>
                </div>
                <div className="step-item active">
                  <div className="step-number">2</div>
                  <div className="step-label">Equipment Details</div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-label">Ops Clearance</div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-label">Confirmed Booking</div>
                </div>
              </div>

              {/* Request Form */}
              <form onSubmit={handleFarmerSubmitRequest}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Select Farm / Land Parcel</label>
                    <select
                      className="form-control"
                      value={selectedFarmId}
                      onChange={e => setSelectedFarmId(e.target.value)}
                      required
                    >
                      {farmerFarms.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.farm_name} ({f.size_acres} acres - {f.address})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Implement Required</label>
                    <select
                      className="form-control"
                      value={implementRequired}
                      onChange={e => setImplementRequired(e.target.value)}
                    >
                      <option value="Rotavator">Rotavator (42-blade tilling)</option>
                      <option value="MB Plough">MB Plough (Deep furrow)</option>
                      <option value="Disc Harrow">Disc Harrow (Clod crushing)</option>
                      <option value="Cultivator">Heavy Duty Cultivator</option>
                      <option value="Laser Leveler">Laser Land Leveler</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Estimated Area (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      className="form-control"
                      value={estimatedUnits}
                      onChange={e => setEstimatedUnits(parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="form-control"
                      value={requestedDate}
                      onChange={e => setRequestedDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time Window</label>
                    <select
                      className="form-control"
                      value={timeWindow}
                      onChange={e => setTimeWindow(e.target.value)}
                    >
                      <option value="06:00 - 10:00">Early Morning (06:00 - 10:00)</option>
                      <option value="08:00 - 12:00">Morning Shift (08:00 - 12:00)</option>
                      <option value="14:00 - 18:00">Afternoon Shift (14:00 - 18:00)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Soil Condition</label>
                  <select
                    className="form-control"
                    value={soilCondition}
                    onChange={e => setSoilCondition(e.target.value)}
                  >
                    <option value="Dry Loam">Dry Loam (Standard)</option>
                    <option value="Wet Clay / Paddy">Wet Clay / Paddy Field</option>
                    <option value="Sandy / Red Soil">Sandy / Red Soil</option>
                    <option value="Hard Crusted / Rocky">Hard Crusted / Rocky</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isFarmerSubmitting}>
                  {isFarmerSubmitting ? 'Matching Eligible Providers...' : 'Submit Tractor Request & Match Providers'}
                </button>
              </form>
            </div>

            {/* Skeleton Loader during matching simulation */}
            {isFarmerSubmitting && (
              <div className="card">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-text"></div>
              </div>
            )}

            {/* Confirmed Booking Display with Completion OTP */}
            {activeBooking && (
              <div className="card" style={{ borderColor: 'var(--color-accent)' }}>
                <div className="card-header">
                  <h3 className="card-title">Active Booking #{activeBooking.bookingId}</h3>
                  <span className="badge badge-success">{activeBooking.status}</span>
                </div>

                <div className="otp-display-card">
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    FARMER SERVICE COMPLETION VERIFICATION OTP
                  </div>
                  <div className="otp-digits">{activeBooking.completionOtp}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                    Share this 6-digit code with the tractor driver <strong>ONLY AFTER</strong> inspecting the field and confirming satisfactory completion of work.
                  </p>
                </div>

                <div className="price-line-row">
                  <span>Selected Payment Condition:</span>
                  <strong>{activeBooking.paymentType} Payment on Job Completion</strong>
                </div>
                <div className="price-line-row">
                  <span>Confirmed Service Total:</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>₹{activeBooking.totalAmount}</strong>
                </div>
              </div>
            )}

            {/* Farmer's Submitted Requests & Quotations */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Your Tractor Requests</h3>
                <span className="badge badge-info">{farmerRequests.length} Total</span>
              </div>

              {farmerRequests.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No requests created yet. Submit your first request above!</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Farm Parcel</th>
                        <th>Date & Window</th>
                        <th>Units</th>
                        <th>Status</th>
                        <th>Invited</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerRequests.map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.id}</strong></td>
                          <td>{r.farm_name}</td>
                          <td>{r.scheduled_date} ({r.time_window})</td>
                          <td>{r.estimated_units} {r.unit_type}s</td>
                          <td>
                            <span className={`badge ${r.status === 'OFFER_WINDOW_OPEN' ? 'badge-pending' : r.status === 'QUOTATION_SELECTED' ? 'badge-success' : 'badge-info'}`}>
                              {r.status}
                            </span>
                          </td>
                          <td>{r.invitations_count || 1} Provider(s)</td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setActiveFarmerRequest(r);
                                handleViewQuotations(r.id);
                              }}
                            >
                              View Quotations ({r.approved_quotes_count || 0})
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quotations Comparison Drawer */}
            {activeFarmerRequest && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    Approved Quotations for Request #{activeFarmerRequest.id}
                  </h3>
                  <span className="badge badge-success">{approvedQuotations.length} Available</span>
                </div>

                {approvedQuotations.length === 0 ? (
                  <div className="alert alert-warning">
                    No approved quotations yet. Once providers submit bids and Akanksha Operations staff approves the price benchmark, quotations will appear here.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                    {approvedQuotations.map(q => (
                      <div key={q.id} className="card" style={{ border: '2px solid var(--color-accent)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h4 style={{ color: 'var(--color-primary)' }}>{q.business_name}</h4>
                          <span className="badge badge-success">Verified Provider ({q.rating} ★)</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          Distance: <strong>{q.distance_km} km away</strong> &bull; Contact: {q.contact_person}
                        </p>
                        <p style={{ fontSize: '0.85rem', margin: '0.5rem 0', fontStyle: 'italic' }}>
                          "{q.provider_note}"
                        </p>

                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', margin: '0.75rem 0' }}>
                          {q.lines?.map((l: any, i: number) => (
                            <div key={i} className="price-line-row">
                              <span>{l.quantity} {l.unit}s @ ₹{l.unit_rate}/{l.unit}</span>
                              <span>₹{l.quantity * l.unit_rate}</span>
                            </div>
                          ))}
                          {q.lines?.[0]?.mobilization_charge > 0 && (
                            <div className="price-line-row">
                              <span>Mobilization / Fuel Fee</span>
                              <span>₹{q.lines[0].mobilization_charge}</span>
                            </div>
                          )}
                          <div className="price-line-row price-line-total">
                            <span>Total Payable (Cash):</span>
                            <span>₹{q.total_amount}</span>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary"
                          style={{ width: '100%' }}
                          onClick={() => handleSelectQuotation(q.id)}
                        >
                          Select & Confirm Booking
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. PROVIDER PORTAL */}
        {activeTab === 'provider' && (
          <div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Provider Dispatch Radar</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Logged in as: <strong>Siva Kumar Agri Mechanization</strong> (+91 98765 43211) &bull; Mahindra 575 DI (45 HP)
                  </p>
                </div>
                <span className="badge badge-success">Verified Equipment Partner</span>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>
                Incoming Service Invitations (Matching Radius $\le 30$ km)
              </h3>

              {providerInvitations.length === 0 ? (
                <div className="alert alert-info">No active invitations at this moment. New farmer requests matching your base location will appear here automatically.</div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Farm Location</th>
                        <th>Distance</th>
                        <th>Requested Date</th>
                        <th>Work Scope</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providerInvitations.map(inv => (
                        <tr key={inv.id}>
                          <td>
                            <strong>{inv.farm_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{inv.farm_address}</div>
                          </td>
                          <td><strong>{inv.distance_km} km</strong></td>
                          <td>{inv.scheduled_date} ({inv.time_window})</td>
                          <td>{inv.estimated_units} {inv.unit_type}s</td>
                          <td>
                            <span className={`badge ${inv.status === 'SUBMITTED' ? 'badge-success' : 'badge-pending'}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td>
                            {inv.status === 'PENDING' ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setSelectedInvitationId(inv.id);
                                  setQuoteQuantity(inv.estimated_units);
                                }}
                              >
                                Submit Itemized Quote
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                Quotation: ₹{inv.quotation_amount} ({inv.quotation_status})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quotation Submission Drawer */}
            {selectedInvitationId && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Prepare Itemized Quotation for Invitation #{selectedInvitationId}</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInvitationId('')}>Cancel</button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Units (Acres / Hours)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quoteQuantity}
                      onChange={e => setQuoteQuantity(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit Rate (₹ per acre)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quoteUnitRate}
                      onChange={e => setQuoteUnitRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobilization / Fuel Fee (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quoteMobilization}
                      onChange={e => setQuoteMobilization(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Material / Consumables Fee (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quoteMaterials}
                      onChange={e => setQuoteMaterials(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Provider Note to Farmer & Operations</label>
                  <input
                    type="text"
                    className="form-control"
                    value={providerNote}
                    onChange={e => setProviderNote(e.target.value)}
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '4px', margin: '1rem 0' }}>
                  <div className="price-line-row">
                    <span>Field Work Subtotal:</span>
                    <span>₹{quoteQuantity * quoteUnitRate}</span>
                  </div>
                  <div className="price-line-row">
                    <span>Mobilization Fee:</span>
                    <span>₹{quoteMobilization}</span>
                  </div>
                  <div className="price-line-row price-line-total">
                    <span>Total Bid Amount:</span>
                    <span>₹{(quoteQuantity * quoteUnitRate) + quoteMobilization + quoteMaterials}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleProviderSubmitQuotation(selectedInvitationId)}
                >
                  Submit Quote to Operations for Approval
                </button>
              </div>
            )}

            {/* Active Execution & Completion OTP Verification */}
            {activeBooking && (
              <div className="card" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="card-header">
                  <h3 className="card-title">Job Execution & Trip Control (Booking #{activeBooking.bookingId})</h3>
                  <span className="badge badge-info">{activeBooking.status}</span>
                </div>

                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Live Execution Workflow: Transition trip state as you travel and perform the field mechanization.
                </p>

                <div className="trip-actions-grid" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleTripUpdate(activeBooking.bookingId, 'TRAVEL_READY')}>
                    1. Travel Ready
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleTripUpdate(activeBooking.bookingId, 'IN_PROGRESS')}>
                    2. Start Trip (Live GPS)
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleTripUpdate(activeBooking.bookingId, 'ARRIVED')}>
                    3. Mark Arrived at Farm
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleTripUpdate(activeBooking.bookingId, 'WORK_STARTED')}>
                    4. Begin Field Work
                  </button>
                </div>

                {/* Final Completion OTP Input */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                  <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    Verify Service Completion (6-Digit Farmer OTP)
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    Ask the farmer for their completion OTP after they inspect your tilling. Entering this code releases the cash settlement and marks the booking closed.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '350px' }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      className="form-control"
                      value={completionOtpInput}
                      onChange={e => setCompletionOtpInput(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleVerifyCompletionOtp(activeBooking.bookingId)}
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. OPERATIONS ADMIN CONSOLE */}
        {activeTab === 'operations' && (
          <div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Operations Clearance Desk</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Staff Price Approval & Fallback Queue &bull; Hub: <strong>Vijayawada Operations</strong>
                  </p>
                </div>
                <span className="badge badge-info">Audited Control Desk</span>
              </div>

              <div className="form-group">
                <label className="form-label">Mandatory Audit Note for Decisions</label>
                <input
                  type="text"
                  className="form-control"
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                />
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.5rem 0' }}>
                Quotations Requiring Price Clearance
              </h3>

              {pendingReviews.length === 0 ? (
                <div className="alert alert-info">No quotations pending review. All provider quotes have been processed.</div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Quote ID</th>
                        <th>Provider</th>
                        <th>Farm Location</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingReviews.map(q => (
                        <tr key={q.id}>
                          <td><strong>{q.id}</strong></td>
                          <td>
                            {q.business_name} ({q.provider_rating} ★)
                          </td>
                          <td>{q.farm_name} ({q.district_name})</td>
                          <td><strong>₹{q.total_amount}</strong></td>
                          <td>
                            <span className={`badge ${q.status === 'APPROVED' ? 'badge-success' : q.status === 'REJECTED' ? 'badge-danger' : 'badge-pending'}`}>
                              {q.status}
                            </span>
                          </td>
                          <td>
                            {q.status === 'PENDING_REVIEW' ? (
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleReviewQuotation(q.id, 'APPROVED')}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleReviewQuotation(q.id, 'REJECTED')}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Staff Queue (Unassigned requests with 0 matching providers) */}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '2rem 0 0.5rem 0' }}>
                Unmatched Requests Fallback Queue (StaffQueue)
              </h3>
              {staffQueue.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Zero unmatched requests. All farmer requests successfully matched with active providers within radius!
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Farmer</th>
                        <th>District</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffQueue.map(sq => (
                        <tr key={sq.id}>
                          <td>{sq.id}</td>
                          <td>{sq.farmer_name}</td>
                          <td>{sq.district_name}</td>
                          <td><span className="badge badge-danger">MANUAL_DISPATCH_REQUIRED</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. COMPLIANCE & DISTRICTS DIRECTORY */}
        {activeTab === 'compliance' && (
          <div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Regional Service Coverage</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    All 61 Reference Districts across Andhra Pradesh & Telangana
                  </p>
                </div>
                <span className="badge badge-success">61 Districts Active</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
                {districts.map(d => (
                  <div key={d.id} style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', fontSize: '0.85rem' }}>
                    <strong>{d.district_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{d.state} ({d.district_code})</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authentic Terms of Service & Privacy (Addressing Anti-Patterns #26 & #27) */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>
                Platform Governance, Terms of Service & Farmer Data Protection
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>1. Dispatch & Matching Integrity:</strong> Akanksha Agree Tech (AAT) enforces cryptographic and row-level locking on all quotation selections. A provider is only invited if verified and located within the configured service radius ($\le 30$ km).
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>2. Fair Pricing & Price Clearance:</strong> All submitted bids undergo mandatory Operations Clearance to protect farmers against uncompetitive price spikes. Unapproved quotations are strictly prohibited from appearing in the farmer's portal.
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>3. Two-Party Completion Protocol:</strong> Cash settlement and job closure occur exclusively upon submission of the farmer's confidential 6-digit completion verification OTP.
                </p>
                <p>
                  <strong>4. Data Confidentiality:</strong> Phone numbers are hashed or masked in structured application logs. Exact farm coordinates are revealed only to the confirmed equipment partner.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
