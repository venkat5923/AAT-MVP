// Standard API Response Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  correlationId: string;
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details: ApiErrorDetail[];
  correlationId: string;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

// User & Role Types
export type UserRole = 'farmer' | 'provider' | 'staff' | 'admin';

export interface UserSession {
  userId: string;
  phone: string;
  roles: UserRole[];
  profileId?: string;
}

// Request & Booking Lifecycle States
export type ServiceRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MATCHING'
  | 'STAFF_QUEUE'
  | 'OFFER_WINDOW_OPEN'
  | 'QUOTATIONS_RECEIVED'
  | 'QUOTATION_SELECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BookingStatus =
  | 'CONFIRMED'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'TRAVEL_READY'
  | 'IN_PROGRESS'
  | 'ARRIVED'
  | 'WORK_STARTED'
  | 'COMPLETION_PENDING_OTP'
  | 'COMPLETED'
  | 'CASH_CLOSED'
  | 'SETTLEMENT_RELEASED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type QuotationStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SELECTED'
  | 'EXPIRED';

export type QuotationUnit = 'hour' | 'acre' | 'trip';

export type PaymentCondition = 'CASH' | 'ONLINE';

// DTOs
export interface RequestOtpDto {
  phone: string;
  role?: UserRole;
}

export interface VerifyOtpDto {
  phone: string;
  otp: string;
}

export interface CreateFarmDto {
  farmName: string;
  districtId: string;
  address: string;
  latitude: number;
  longitude: number;
  surveyNumber?: string;
  sizeAcres: number;
  soilType?: string;
}

export interface CreateTractorRequestDto {
  farmId: string;
  serviceId: string;
  requestedDate: string; // ISO date
  timeWindow: string; // e.g. "08:00 - 12:00"
  estimatedUnits: number;
  unitType: 'hour' | 'acre';
  implementRequired: string; // 'Rotavator' | 'MB Plough' | 'Disc Harrow' | 'Cultivator'
  soilCondition?: string;
  notes?: string;
}

export interface SubmitQuotationLineDto {
  unit: QuotationUnit;
  quantity: number;
  unitRate: number;
  mobilizationCharge: number;
  materialCharge: number;
  taxAmount?: number;
}

export interface SubmitQuotationDto {
  invitationId: string;
  lines: SubmitQuotationLineDto[];
  providerNote?: string;
  validHours?: number;
}

export interface ReviewQuotationDto {
  decision: 'APPROVED' | 'REJECTED';
  reason: string;
}

export interface SelectQuotationDto {
  paymentCondition: PaymentCondition;
}

export interface VerifyCompletionDto {
  completionOtp: string;
  notes?: string;
}
