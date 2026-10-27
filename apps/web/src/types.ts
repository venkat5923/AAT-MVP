export type ScreenType =
  | 'home'
  | 'drip'
  | 'drone'
  | 'tractor'
  | 'machines'
  | 'crop_selection'
  | 'service_selection'
  | 'booking_summary'
  | 'payment'
  | 'tracking'
  | 'bookings'
  | 'store'
  | 'support'
  | 'wallet'
  | 'profile'
  | 'provider'
  | 'admin';

export type Language = 'en' | 'te';

export type Persona = 'farmer' | 'provider_tractor' | 'provider_drone' | 'admin';

export interface CartItem {
  id: string;
  name: string;
  nameTe?: string;
  price: number;
  unit: string;
  unitTe?: string;
  quantity: number;
  category: string;
  imageIcon: string;
}

export interface BookingRecord {
  id: string;
  type: 'drone' | 'tractor' | 'machine' | 'drip';
  title: string;
  titleTe?: string;
  details: string;
  detailsTe?: string;
  date: string;
  time: string;
  amount: number;
  status: 'CONFIRMED' | 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  statusTe?: string;
  driverName?: string;
  driverPhone?: string;
  equipmentPlate?: string;
  rating?: number;
  etaMinutes?: number;
}

export interface TransactionRecord {
  id: string;
  title: string;
  titleTe?: string;
  date: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
}

export interface ProductItem {
  id: string;
  name: string;
  nameTe: string;
  price: number;
  unit: string;
  unitTe: string;
  rating: number;
  category: string;
  description: string;
  icon: string;
}

export interface TractorItem {
  id: string;
  name: string;
  nameTe: string;
  hp: string;
  ratePerHour: number;
  withOperator: boolean;
  implement: string;
  rating: number;
  tripsCompleted: number;
  icon: string;
  tag?: string;
}

export interface MachineItem {
  id: string;
  name: string;
  nameTe: string;
  category: string;
  ratePerHour: number;
  unitLabel: string;
  unitLabelTe: string;
  rating: number;
  icon: string;
  specs: string;
}

export interface DroneServiceItem {
  id: string;
  title: string;
  titleTe: string;
  desc: string;
  descTe: string;
  pricePerAcre: number;
  icon: string;
}

export interface CropItem {
  id: string;
  name: string;
  nameTe: string;
  season: string;
  seasonTe: string;
  icon: string;
}
