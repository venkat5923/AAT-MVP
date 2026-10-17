// AAT API Service & Unified Client-Side Engine
// Provides safe, zero-crash network communication with seamless fallback
// for static deployments (Vercel, Netlify, GitHub Pages) and local dev.

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    isLiveBackend: boolean;
    timestamp: string;
  };
}

export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

// 1. Geospatial Haversine calculation
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// 2. 61 Reference Districts for AP & Telangana
export const DEFAULT_DISTRICTS = [
  // Andhra Pradesh (26)
  { id: 'ap-1', name: 'Alluri Sitharama Raju', state: 'Andhra Pradesh' },
  { id: 'ap-2', name: 'Anakapalli', state: 'Andhra Pradesh' },
  { id: 'ap-3', name: 'Ananthapuramu', state: 'Andhra Pradesh' },
  { id: 'ap-4', name: 'Annamayya', state: 'Andhra Pradesh' },
  { id: 'ap-5', name: 'Bapatla', state: 'Andhra Pradesh' },
  { id: 'ap-6', name: 'Chittoor', state: 'Andhra Pradesh' },
  { id: 'ap-7', name: 'Dr. B.R. Ambedkar Konaseema', state: 'Andhra Pradesh' },
  { id: 'ap-8', name: 'East Godavari', state: 'Andhra Pradesh' },
  { id: 'ap-9', name: 'Eluru', state: 'Andhra Pradesh' },
  { id: 'ap-10', name: 'Guntur', state: 'Andhra Pradesh' },
  { id: 'ap-11', name: 'Kakinada', state: 'Andhra Pradesh' },
  { id: 'ap-12', name: 'Krishna', state: 'Andhra Pradesh' },
  { id: 'ap-13', name: 'Kurnool', state: 'Andhra Pradesh' },
  { id: 'ap-14', name: 'Nandyal', state: 'Andhra Pradesh' },
  { id: 'ap-15', name: 'NTR', state: 'Andhra Pradesh' },
  { id: 'ap-16', name: 'Palnadu', state: 'Andhra Pradesh' },
  { id: 'ap-17', name: 'Parvathipuram Manyam', state: 'Andhra Pradesh' },
  { id: 'ap-18', name: 'Prakasam', state: 'Andhra Pradesh' },
  { id: 'ap-19', name: 'Sri Potti Sriramulu Nellore', state: 'Andhra Pradesh' },
  { id: 'ap-20', name: 'Sri Sathya Sai', state: 'Andhra Pradesh' },
  { id: 'ap-21', name: 'Srikakulam', state: 'Andhra Pradesh' },
  { id: 'ap-22', name: 'Tirupati', state: 'Andhra Pradesh' },
  { id: 'ap-23', name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { id: 'ap-24', name: 'Vizianagaram', state: 'Andhra Pradesh' },
  { id: 'ap-25', name: 'West Godavari', state: 'Andhra Pradesh' },
  { id: 'ap-26', name: 'YSR Kadapa', state: 'Andhra Pradesh' },
  // Telangana (35)
  { id: 'tg-1', name: 'Adilabad', state: 'Telangana' },
  { id: 'tg-2', name: 'Bhadradri Kothagudem', state: 'Telangana' },
  { id: 'tg-3', name: 'Hanamkonda', state: 'Telangana' },
  { id: 'tg-4', name: 'Hyderabad', state: 'Telangana' },
  { id: 'tg-5', name: 'Jagtial', state: 'Telangana' },
  { id: 'tg-6', name: 'Jangaon', state: 'Telangana' },
  { id: 'tg-7', name: 'Jayashankar Bhupalpally', state: 'Telangana' },
  { id: 'tg-8', name: 'Jogulamba Gadwal', state: 'Telangana' },
  { id: 'tg-9', name: 'Kamareddy', state: 'Telangana' },
  { id: 'tg-10', name: 'Karimnagar', state: 'Telangana' },
  { id: 'tg-11', name: 'Khammam', state: 'Telangana' },
  { id: 'tg-12', name: 'Kumuram Bheem Asifabad', state: 'Telangana' },
  { id: 'tg-13', name: 'Mahabubabad', state: 'Telangana' },
  { id: 'tg-14', name: 'Mahabubnagar', state: 'Telangana' },
  { id: 'tg-15', name: 'Mancherial', state: 'Telangana' },
  { id: 'tg-16', name: 'Medak', state: 'Telangana' },
  { id: 'tg-17', name: 'Medchal-Malkajgiri', state: 'Telangana' },
  { id: 'tg-18', name: 'Mulugu', state: 'Telangana' },
  { id: 'tg-19', name: 'Nagarkurnool', state: 'Telangana' },
  { id: 'tg-20', name: 'Nalgonda', state: 'Telangana' },
  { id: 'tg-21', name: 'Narayanpet', state: 'Telangana' },
  { id: 'tg-22', name: 'Nirmal', state: 'Telangana' },
  { id: 'tg-23', name: 'Nizamabad', state: 'Telangana' },
  { id: 'tg-24', name: 'Peddapalli', state: 'Telangana' },
  { id: 'tg-25', name: 'Rajanna Sircilla', state: 'Telangana' },
  { id: 'tg-26', name: 'Ranga Reddy', state: 'Telangana' },
  { id: 'tg-27', name: 'Sangareddy', state: 'Telangana' },
  { id: 'tg-28', name: 'Siddipet', state: 'Telangana' },
  { id: 'tg-29', name: 'Suryapet', state: 'Telangana' },
  { id: 'tg-30', name: 'Vikarabad', state: 'Telangana' },
  { id: 'tg-31', name: 'Wanaparthy', state: 'Telangana' },
  { id: 'tg-32', name: 'Warangal', state: 'Telangana' },
  { id: 'tg-33', name: 'Yadadri Bhuvanagiri', state: 'Telangana' },
  { id: 'tg-34', name: 'GHMC Central', state: 'Telangana' },
  { id: 'tg-35', name: 'Secunderabad', state: 'Telangana' },
];

// 3. Seed Farms
export const DEFAULT_FARMS = [
  {
    id: 'farm-guntur-paddy',
    farmer_id: 'usr-farmer-ramesh',
    farm_name: 'Guntur East Paddy Field',
    size_acres: 5.5,
    soil_type: 'Clay Loam',
    latitude: 16.3067,
    longitude: 80.4365,
    address: 'Pedakakani Mandal, Guntur Rural',
  },
  {
    id: 'farm-amaravati-cotton',
    farmer_id: 'usr-farmer-ramesh',
    farm_name: 'Amaravati Cotton Land',
    size_acres: 8.0,
    soil_type: 'Black Cotton',
    latitude: 16.5131,
    longitude: 80.516,
    address: 'Thullur Mandal, Amaravati Area',
  },
];

// 4. Seed Providers
export const DEFAULT_PROVIDERS = [
  {
    id: 'prov-siva-kumar',
    user_id: 'usr-provider-siva',
    business_name: 'Siva Kumar Agri Mechanization',
    contact_phone: '+919876543211',
    base_latitude: 16.31,
    base_longitude: 80.44,
    service_radius_km: 30,
    equipment: 'Mahindra 575 DI (45 HP) with 42-blade Rotavator',
  },
  {
    id: 'prov-krishna-krishi',
    user_id: 'usr-provider-krishna',
    business_name: 'Krishna Krishi Implements',
    contact_phone: '+919876543212',
    base_latitude: 16.33,
    base_longitude: 80.41,
    service_radius_km: 35,
    equipment: 'John Deere 5050D (50 HP) with 9-tyne Cultivator',
  },
];

// Safe HTTP Fetch Helper that never crashes on HTML 404/500/502
async function safeFetchJson(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data?: any; isHtml?: boolean }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data, isHtml: false };
    }
    // Received non-JSON (HTML 404, 502, proxy error)
    return { ok: false, status: res.status, isHtml: true };
  } catch (err) {
    return { ok: false, status: 0, isHtml: false };
  }
}

// Client-Side Simulated Store for Standalone / Static Deployment Mode
class StandaloneStore {
  private requests: any[] = [];
  private invitations: any[] = [];
  private quotations: any[] = [];
  private priceReviews: any[] = [];
  private bookings: any[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          'aat_standalone_state',
          JSON.stringify({
            requests: this.requests,
            invitations: this.invitations,
            quotations: this.quotations,
            priceReviews: this.priceReviews,
            bookings: this.bookings,
          })
        );
      }
    } catch (e) {
      // Storage unavailable or disabled
    }
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('aat_standalone_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.requests = parsed.requests || [];
          this.invitations = parsed.invitations || [];
          this.quotations = parsed.quotations || [];
          this.priceReviews = parsed.priceReviews || [];
          this.bookings = parsed.bookings || [];
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  createRequest(data: {
    farmId: string;
    serviceId: string;
    scheduledDate: string;
    timeWindow: string;
    estimatedUnits: number;
    unitType: string;
    implementRequired: string;
    soilCondition: string;
    notes: string;
  }) {
    const farm = DEFAULT_FARMS.find(f => f.id === data.farmId) || DEFAULT_FARMS[0];
    const requestId = `req-${Math.random().toString(36).substring(2, 8)}`;
    
    // Match eligible providers within their operational radius using Haversine
    const matchedProviders = DEFAULT_PROVIDERS.map(p => {
      const distanceKm = calculateHaversineDistanceKm(
        farm.latitude,
        farm.longitude,
        p.base_latitude,
        p.base_longitude
      );
      return { ...p, distanceKm };
    })
      .filter(p => p.distanceKm <= p.service_radius_km)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const newRequest = {
      id: requestId,
      farm_id: farm.id,
      farm_name: farm.farm_name,
      farmer_phone: '+919876543210',
      service_id: data.serviceId,
      status: 'OFFER_WINDOW_OPEN',
      scheduled_date: data.scheduledDate,
      time_window: data.timeWindow,
      estimated_units: data.estimatedUnits,
      unit_type: data.unitType,
      implement_required: data.implementRequired,
      soil_condition: data.soilCondition,
      notes: data.notes,
      created_at: new Date().toISOString(),
      matched_providers: matchedProviders.map(p => ({
        providerId: p.id,
        businessName: p.business_name,
        distanceKm: p.distanceKm,
      })),
    };

    this.requests.unshift(newRequest);

    // Create provider invitations
    matchedProviders.forEach(p => {
      const invId = `inv-${Math.random().toString(36).substring(2, 8)}`;
      this.invitations.unshift({
        id: invId,
        request_id: requestId,
        provider_id: p.id,
        provider_name: p.business_name,
        status: 'PENDING',
        distance_km: p.distanceKm,
        created_at: new Date().toISOString(),
        request: newRequest,
      });
    });

    this.saveToStorage();
    return newRequest;
  }

  getRequests() {
    return this.requests;
  }

  getInvitations() {
    return this.invitations;
  }

  submitQuotation(invitationId: string, lines: any[], providerNote: string) {
    const inv = this.invitations.find(i => i.id === invitationId);
    const quotationId = `quote-${Math.random().toString(36).substring(2, 8)}`;
    
    let subtotal = 0;
    let mobilization = 0;
    let materials = 0;

    lines.forEach(l => {
      subtotal += (l.quantity || 0) * (l.unitRate || 0);
      mobilization += l.mobilizationCharge || 0;
      materials += l.materialCharge || 0;
    });

    const total = subtotal + mobilization + materials;

    const newQuotation = {
      id: quotationId,
      request_id: inv ? inv.request_id : 'req-default',
      provider_id: inv ? inv.provider_id : 'prov-siva-kumar',
      provider_name: inv ? inv.provider_name : 'Siva Kumar Agri Mechanization',
      invitation_id: invitationId,
      status: 'PENDING_REVIEW',
      subtotal_amount: subtotal,
      mobilization_amount: mobilization,
      material_amount: materials,
      total_amount: total,
      provider_note: providerNote,
      created_at: new Date().toISOString(),
      lines,
    };

    this.quotations.push(newQuotation);
    if (inv) inv.status = 'QUOTED';

    // Add to Operations Price Review Queue
    this.priceReviews.unshift({
      id: `rev-${Math.random().toString(36).substring(2, 8)}`,
      quotation_id: quotationId,
      request_id: newQuotation.request_id,
      provider_name: newQuotation.provider_name,
      total_amount: total,
      status: 'PENDING_REVIEW',
      created_at: new Date().toISOString(),
      quotation: newQuotation,
    });

    this.saveToStorage();
    return newQuotation;
  }

  getPriceReviews() {
    return this.priceReviews;
  }

  reviewQuotation(quotationId: string, decision: 'APPROVED' | 'REJECTED', reason: string) {
    const quote = this.quotations.find(q => q.id === quotationId);
    if (quote) {
      quote.status = decision;
      quote.review_notes = reason;
      quote.reviewed_at = new Date().toISOString();
    }

    const review = this.priceReviews.find(r => r.quotation_id === quotationId);
    if (review) {
      review.status = decision;
      review.decision = decision;
      review.reason = reason;
      review.reviewed_at = new Date().toISOString();
    }

    this.saveToStorage();
    return { quotationId, status: decision, reason };
  }

  getApprovedQuotations(requestId: string) {
    return this.quotations.filter(q => q.request_id === requestId && q.status === 'APPROVED');
  }

  selectQuotation(quotationId: string, paymentCondition: string = 'CASH') {
    const quote = this.quotations.find(q => q.id === quotationId);
    const bookingId = `book-${Math.random().toString(36).substring(2, 8)}`;
    const completionOtp = Math.floor(100000 + Math.random() * 900000).toString();

    if (quote) {
      quote.status = 'ACCEPTED';
    }

    // Mark other quotations for the same request as REJECTED_BY_FARMER
    if (quote) {
      this.quotations.forEach(q => {
        if (q.request_id === quote.request_id && q.id !== quotationId) {
          q.status = 'REJECTED_BY_FARMER';
        }
      });
    }

    const newBooking = {
      bookingId,
      requestId: quote ? quote.request_id : '',
      quotationId,
      providerId: quote ? quote.provider_id : 'prov-siva-kumar',
      providerName: quote ? quote.provider_name : 'Siva Kumar Agri Mechanization',
      totalAmount: quote ? quote.total_amount : 4950,
      paymentCondition,
      status: 'CONFIRMED',
      completionOtp,
      createdAt: new Date().toISOString(),
    };

    this.bookings.push(newBooking);
    this.saveToStorage();
    return newBooking;
  }

  updateTripStatus(bookingId: string, status: string) {
    const booking = this.bookings.find(b => b.bookingId === bookingId);
    if (booking) {
      booking.status = status;
      this.saveToStorage();
    }
    return { bookingId, status };
  }

  verifyCompletionOtp(bookingId: string, otp: string) {
    const booking = this.bookings.find(b => b.bookingId === bookingId);
    if (!booking) {
      throw new Error(`Booking #${bookingId} not found.`);
    }
    if (booking.completionOtp !== otp.trim()) {
      throw new Error(`Invalid 6-digit Completion OTP. Please check the farmer's confirmation code.`);
    }
    booking.status = 'CASH_CLOSED';
    this.saveToStorage();
    return { bookingId, finalStatus: 'CASH_CLOSED' };
  }
}

export const standaloneStore = new StandaloneStore();

// 5. Unified Service Facade
export class AatApiService {
  private isLiveBackend: boolean = false;

  async checkHealth(): Promise<boolean> {
    const res = await safeFetchJson(`${API_BASE}/health`);
    if (res.ok && res.data && res.data.status === 'UP') {
      this.isLiveBackend = true;
    } else {
      // Test catalog endpoint as secondary check
      const catRes = await safeFetchJson(`${API_BASE}/districts`);
      this.isLiveBackend = catRes.ok && Array.isArray(catRes.data?.data);
    }
    return this.isLiveBackend;
  }

  getLiveStatus(): boolean {
    return this.isLiveBackend;
  }

  async authenticate(phone: string, otp: string, role: string): Promise<string> {
    if (this.isLiveBackend) {
      const res = await safeFetchJson(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, role }),
      });
      if (res.ok && res.data?.data?.token) {
        return res.data.data.token;
      }
    }
    // Standalone simulated auth token
    return `standalone_jwt_${role}_${phone.replace(/[^0-9]/g, '')}`;
  }

  async getDistricts(): Promise<any[]> {
    if (this.isLiveBackend) {
      const res = await safeFetchJson(`${API_BASE}/districts`);
      if (res.ok && res.data?.data) {
        return res.data.data;
      }
    }
    return DEFAULT_DISTRICTS;
  }

  async getFarms(token: string): Promise<any[]> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/farms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.data) {
        return res.data.data;
      }
    }
    return DEFAULT_FARMS;
  }

  async createFarmerRequest(data: any, token: string): Promise<ApiResponse> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok && res.data) {
        return res.data;
      }
      if (res.isHtml) {
        // Fall back gracefully to standalone engine
        this.isLiveBackend = false;
      }
    }

    // Standalone fallback execution
    const request = standaloneStore.createRequest(data);
    return {
      success: true,
      data: request,
      meta: { isLiveBackend: false, timestamp: new Date().toISOString() },
    };
  }

  async getFarmerRequests(token: string): Promise<any[]> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.data) {
        return res.data.data;
      }
    }
    return standaloneStore.getRequests();
  }

  async getProviderInvitations(token: string): Promise<any[]> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/provider/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.data) {
        return res.data.data;
      }
    }
    return standaloneStore.getInvitations();
  }

  async submitQuotation(invitationId: string, lines: any[], providerNote: string, token: string): Promise<ApiResponse> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/provider/invitations/${invitationId}/quotation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lines, providerNote, validHours: 24 }),
      });
      if (res.ok && res.data) {
        return res.data;
      }
    }

    const quotation = standaloneStore.submitQuotation(invitationId, lines, providerNote);
    return {
      success: true,
      data: quotation,
      meta: { isLiveBackend: false, timestamp: new Date().toISOString() },
    };
  }

  async getPriceReviews(token: string): Promise<any[]> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/operations/price-reviews?status=ALL`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.data) {
        return res.data.data;
      }
    }
    return standaloneStore.getPriceReviews();
  }

  async reviewQuotation(quotationId: string, decision: 'APPROVED' | 'REJECTED', reason: string, token: string): Promise<ApiResponse> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/operations/quotations/${quotationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision, reason }),
      });
      if (res.ok && res.data) {
        return res.data;
      }
    }

    const review = standaloneStore.reviewQuotation(quotationId, decision, reason);
    return {
      success: true,
      data: review,
      meta: { isLiveBackend: false, timestamp: new Date().toISOString() },
    };
  }

  async getApprovedQuotations(requestId: string, token: string): Promise<any[]> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/requests/${requestId}/quotations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.data) {
        return res.data.data;
      }
    }
    return standaloneStore.getApprovedQuotations(requestId);
  }

  async selectQuotation(quotationId: string, paymentCondition: string, token: string): Promise<ApiResponse> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/quotations/${quotationId}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentCondition }),
      });
      if (res.ok && res.data) {
        return res.data;
      }
    }

    const booking = standaloneStore.selectQuotation(quotationId, paymentCondition);
    return {
      success: true,
      data: booking,
      meta: { isLiveBackend: false, timestamp: new Date().toISOString() },
    };
  }

  async updateTripStatus(bookingId: string, newStatus: string, token: string): Promise<ApiResponse> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/bookings/${bookingId}/trip-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus, note: `Status updated to ${newStatus}` }),
      });
      if (res.ok && res.data) {
        return res.data;
      }
    }

    const result = standaloneStore.updateTripStatus(bookingId, newStatus);
    return {
      success: true,
      data: result,
      meta: { isLiveBackend: false, timestamp: new Date().toISOString() },
    };
  }

  async verifyCompletionOtp(bookingId: string, otp: string, token: string): Promise<ApiResponse> {
    if (this.isLiveBackend && token && !token.startsWith('standalone_')) {
      const res = await safeFetchJson(`${API_BASE}/bookings/${bookingId}/verify-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completionOtp: otp }),
      });
      if (res.ok && res.data) {
        return res.data;
      }
      if (res.data?.error?.message) {
        return { success: false, error: { code: 'OTP_ERROR', message: res.data.error.message } };
      }
    }

    try {
      const result = standaloneStore.verifyCompletionOtp(bookingId, otp);
      return {
        success: true,
        data: result,
        meta: { isLiveBackend: false, timestamp: new Date().toISOString() },
      };
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'INVALID_OTP', message: err.message },
      };
    }
  }
}

export const api = new AatApiService();
