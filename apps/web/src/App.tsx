import { useState, useEffect } from 'react';
import {
  ScreenType,
  Language,
  Persona,
  CartItem,
  BookingRecord,
  TransactionRecord,
  CropItem,
  TractorItem,
  MachineItem,
} from './types';
import {
  CROPS_DATA,
  INITIAL_BOOKINGS,
  INITIAL_TRANSACTIONS,
} from './data/mockData';
import { api } from './apiService';

// Mobile Components
import { MobileFrame } from './components/MobileFrame';
import { TopAppBar, BottomTabBar } from './components/Navigation';
import { DrawerMenu } from './components/DrawerMenu';
import { HomeScreen } from './components/HomeScreen';
import { DripIrrigationScreen } from './components/DripIrrigationScreen';
import { DroneServicesScreen } from './components/DroneServicesScreen';
import { TractorBookingScreen } from './components/TractorBookingScreen';
import { FarmMachinesScreen } from './components/FarmMachinesScreen';
import { CropSelectionScreen } from './components/CropSelectionScreen';
import { ServiceSelectionScreen } from './components/ServiceSelectionScreen';
import { BookingSummaryScreen } from './components/BookingSummaryScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { LiveTrackingScreen } from './components/LiveTrackingScreen';
import { BookingsScreen } from './components/BookingsScreen';
import { AgriStoreScreen } from './components/AgriStoreScreen';
import { CartModal } from './components/CartModal';
import { ExpertSupportScreen } from './components/ExpertSupportScreen';
import { WalletScreen } from './components/WalletScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ProviderScreen } from './components/ProviderScreen';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';

interface Toast {
  id: string;
  message: string;
}

export default function App() {
  // Navigation & Localization
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [lang, setLang] = useState<Language>('en');
  const [persona, setPersona] = useState<Persona>('farmer');

  // UI Overlays
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // User Profile
  const [farmerName, setFarmerName] = useState<string>('Bhanu Kapa (భాను కాప)');
  const [farmerPhone, setFarmerPhone] = useState<string>('+91 98765 43210');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dundigam Village, Nellore, AP');

  // Commerce & FinTech
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'drip-lat',
      name: 'Inline Drip Laterals (16mm, Class 2)',
      nameTe: 'ఇన్‌లైన్ డ్రిప్ లేటరల్స్ (16mm)',
      price: 12.5,
      unit: 'meter',
      unitTe: 'మీటర్',
      quantity: 100,
      category: 'Drip Systems',
      imageIcon: '💧',
    },
  ]);
  const [walletBalance, setWalletBalance] = useState<number>(2450);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);

  // Active Multi-Step Booking Flow State
  const [selectedCrop, setSelectedCrop] = useState<CropItem>(CROPS_DATA[0]);
  const [selectedAcres, setSelectedAcres] = useState<number>(5.5);
  const [selectedServices, setSelectedServices] = useState<any[]>([
    {
      id: 'plowing',
      name: 'Tractor Plowing (ట్రాక్టర్ దుక్కి)',
      nameTe: 'ట్రాక్టర్ దుక్కి',
      icon: '🚜',
      unitRate: 1200,
      unitType: 'acre',
      unitTypeTe: 'ఎకరం',
      selected: true,
    },
    {
      id: 'rotavator',
      name: 'Rotavator Tillage (రోటా వేటర్)',
      nameTe: 'రోటా వేటర్',
      icon: '⚙️',
      unitRate: 1500,
      unitType: 'acre',
      unitTypeTe: 'ఎకరం',
      selected: true,
    },
    {
      id: 'drone_spray',
      name: 'Drone Spraying (డ్రోన్ స్ప్రేయింగ్)',
      nameTe: 'డ్రోన్ స్ప్రేయింగ్',
      icon: '🚁',
      unitRate: 350,
      unitType: 'acre',
      unitTypeTe: 'ఎకరం',
      selected: true,
    },
  ]);
  const [totalBookingAmount, setTotalBookingAmount] = useState<number>(3050);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<BookingRecord | null>(INITIAL_BOOKINGS[0]);

  // Auth tokens for live backend API sync
  const [authToken, setAuthToken] = useState<string>('');

  // Initial backend health check & persona auth
  useEffect(() => {
    async function init() {
      try {
        await api.checkHealth();
        const token = await api.authenticate('+919876543210', '123456', 'farmer');
        if (token) setAuthToken(token);
        setSelectedDistrict('Dundigam Village, Nellore, AP');
      } catch (e) {
        console.warn('Backend sync in mock mode:', e);
      }
    }
    init();
  }, []);

  // Toast Helper
  const showToast = (message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Language Toggle
  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'te' : 'en';
    setLang(nextLang);
    showToast(nextLang === 'te' ? 'భాష తెలుగులోకి మార్చబడింది 🇮🇳' : 'Switched to English 🇬🇧');
  };

  // Persona Switch Handler
  const handlePersonaChange = (newPersona: Persona) => {
    setPersona(newPersona);
    if (newPersona === 'farmer') {
      setFarmerName('Bhanu Kapa (భాను కాప)');
      setFarmerPhone('+91 98765 43210');
      setCurrentScreen('home');
      showToast('Switched to Farmer Portal (Bhanu Kapa)');
    } else if (newPersona === 'provider_tractor') {
      setFarmerName('Kapa Nani (కాప నాని - ట్రాక్టర్ ఓనర్)');
      setFarmerPhone('+91 98765 43211');
      setCurrentScreen('provider');
      showToast('Switched to Tractor Provider Mode (Kapa Nani)');
    } else if (newPersona === 'provider_drone') {
      setFarmerName('Bhanu Naidu (భాను నాయుడు - డ్రోన్ పైలట్)');
      setFarmerPhone('+91 98765 43212');
      setCurrentScreen('provider');
      showToast('Switched to Drone Operator Mode (Bhanu Naidu)');
    } else if (newPersona === 'admin') {
      setFarmerName('Nellore Ops Hub (అడ్మిన్)');
      setFarmerPhone('+91 98765 43213');
      setCurrentScreen('admin');
      showToast('Switched to Operations Admin Hub (Nellore)');
    }
  };

  // Cart Handlers
  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCartCheckout = (total: number) => {
    setIsCartOpen(false);
    setCartItems([]);
    setWalletBalance(prev => Math.max(0, prev - total));
    setTransactions(prev => [
      {
        id: `TXN-${Date.now().toString().slice(-4)}`,
        title: 'Agri Store & Drip Order',
        titleTe: 'అగ్రి స్టోర్ & డ్రిప్ ఆర్డర్',
        date: 'Today',
        amount: total,
        type: 'debit',
        category: 'Store Order',
      },
      ...prev,
    ]);
    showToast(lang === 'te' ? 'ఆర్డర్ విజయవంతంగా నమోదైంది! డెలివరీ బయలుదేరింది.' : 'Order placed successfully! Dispatched to field.');
  };

  // Wallet Top-Up Handler
  const handleAddMoney = (amount: number) => {
    setWalletBalance(prev => prev + amount);
    setTransactions(prev => [
      {
        id: `TXN-${Date.now().toString().slice(-4)}`,
        title: 'Wallet Top-up via UPI',
        titleTe: 'UPI ద్వారా వాలెట్ రీఛార్జ్',
        date: 'Today',
        amount,
        type: 'credit',
        category: 'Deposit',
      },
      ...prev,
    ]);
  };

  // Drone Service Single Booking Trigger
  const handleInitiateDroneBooking = (details: any) => {
    setTotalBookingAmount(details.totalAmount);
    setSelectedCrop({
      id: 'custom-drone',
      name: details.crop,
      nameTe: details.crop,
      season: 'Current',
      seasonTe: 'ప్రస్తుత',
      icon: '🚁',
    });
    setSelectedAcres(details.area);
    setSelectedServices([
      {
        id: 'drone-spray',
        name: details.serviceName,
        nameTe: details.serviceName,
        icon: '🚁',
        unitRate: details.ratePerAcre,
        unitType: 'acre',
        unitTypeTe: 'ఎకరం',
        selected: true,
      },
    ]);
    setCurrentScreen('booking_summary');
  };

  // Tractor Single Booking Trigger
  const handleSelectTractor = (tractor: TractorItem) => {
    setSelectedServices([
      {
        id: tractor.id,
        name: `${tractor.name} (${tractor.hp})`,
        nameTe: `${tractor.nameTe} (${tractor.hp})`,
        icon: '🚜',
        unitRate: tractor.ratePerHour,
        unitType: 'hour',
        unitTypeTe: 'గంట',
        selected: true,
      },
    ]);
    setTotalBookingAmount(tractor.ratePerHour * 2);
    setCurrentScreen('booking_summary');
  };

  // Farm Machine Single Hire Trigger
  const handleSelectMachine = (machine: MachineItem) => {
    setSelectedServices([
      {
        id: machine.id,
        name: machine.name,
        nameTe: machine.nameTe,
        icon: machine.icon,
        unitRate: machine.ratePerHour,
        unitType: 'hour',
        unitTypeTe: 'గంట',
        selected: true,
      },
    ]);
    setTotalBookingAmount(machine.ratePerHour * 2);
    setCurrentScreen('booking_summary');
  };

  // Payment Completion Handler
  const handleCompletePayment = (paymentMethod: string, amount: number) => {
    const newBookingId = `SVAG${Date.now().toString().slice(-8)}`;
    const newBooking: BookingRecord = {
      id: newBookingId,
      type: 'tractor',
      title: `${selectedCrop.name} Mechanization`,
      titleTe: `${selectedCrop.nameTe} వ్యవసాయ సేవలు`,
      details: `${selectedAcres} Acres • ${selectedServices.map(s => s.name).join(', ')}`,
      detailsTe: `${selectedAcres} ఎకరాలు • ${selectedServices.map(s => s.nameTe).join(', ')}`,
      date: 'Today',
      time: 'Immediate Dispatch',
      amount,
      status: 'ONGOING',
      statusTe: 'ప్రయాణంలో ఉన్నారు (En Route)',
      driverName: 'కాప నాని (Kapa Nani)',
      driverPhone: '+91 98765 43211',
      equipmentPlate: 'AP 26 AB 1234',
      rating: 4.8,
      etaMinutes: 20,
    };

    setBookings(prev => [newBooking, ...prev]);
    setActiveTrackingBooking(newBooking);

    if (paymentMethod === 'wallet') {
      setWalletBalance(prev => Math.max(0, prev - amount));
    }

    setTransactions(prev => [
      {
        id: `TXN-${Date.now().toString().slice(-4)}`,
        title: `${selectedCrop.name} Mechanization Booking`,
        titleTe: `${selectedCrop.nameTe} బుకింగ్ చెల్లింపు`,
        date: 'Today',
        amount,
        type: 'debit',
        category: 'Booking',
      },
      ...prev,
    ]);

    showToast(lang === 'te' ? 'చెల్లింపు విజయవంతమైంది! లైవ్ ట్రాకింగ్ ప్రారంభమైంది.' : 'Payment confirmed! Live tracking launched.');
  };

  // OTP Verification Handler
  const handleVerifyOtp = async (bookingId: string, otp: string): Promise<boolean> => {
    try {
      const res = await api.verifyCompletionOtp(bookingId, otp, authToken);
      if (res && res.success) {
        setBookings(prev =>
          prev.map(b => (b.id === bookingId ? { ...b, status: 'COMPLETED', statusTe: 'పూర్తయింది' } : b))
        );
        return true;
      }
    } catch (e) {
      console.warn('API error during OTP, falling back:', e);
    }
    if (otp === '123456') {
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'COMPLETED', statusTe: 'పూర్తయింది' } : b))
      );
      return true;
    }
    return false;
  };

  // Total cart items count
  const totalCartCount = cartItems.length;

  return (
    <MobileFrame
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      lang={lang}
      onToggleLang={toggleLanguage}
      persona={persona}
      onChangePersona={handlePersonaChange}
    >
      {/* 1. Mobile Top App Bar */}
      <TopAppBar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        lang={lang}
        cartCount={totalCartCount}
        unreadNotifications={2}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* 2. Slide-out Navigation Drawer */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        lang={lang}
        onToggleLang={toggleLanguage}
        persona={persona}
        onChangePersona={handlePersonaChange}
        farmerName={farmerName}
        farmerPhone={farmerPhone}
        selectedDistrict={selectedDistrict}
      />

      {/* 3. Screen Views Switcher */}
      <div className="mobile-screens-container">
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={setCurrentScreen}
            lang={lang}
            farmerName={farmerName}
            selectedDistrict={selectedDistrict}
            onOpenBookingFlow={() => setCurrentScreen('crop_selection')}
          />
        )}

        {currentScreen === 'drip' && (
          <DripIrrigationScreen
            lang={lang}
            onAddToCart={handleAddToCart}
            onBack={() => setCurrentScreen('home')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'drone' && (
          <DroneServicesScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            onInitiateBooking={handleInitiateDroneBooking}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'tractor' && (
          <TractorBookingScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            onSelectTractor={handleSelectTractor}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'machines' && (
          <FarmMachinesScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            onSelectMachine={handleSelectMachine}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'crop_selection' && (
          <CropSelectionScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            onSelectCrop={(crop, acres) => {
              setSelectedCrop(crop);
              setSelectedAcres(acres);
            }}
            selectedCropId={selectedCrop.id}
            initialAcres={selectedAcres}
          />
        )}

        {currentScreen === 'service_selection' && (
          <ServiceSelectionScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            selectedCrop={selectedCrop}
            acres={selectedAcres}
            onConfirmServices={(services, total) => {
              setSelectedServices(services);
              setTotalBookingAmount(total);
            }}
          />
        )}

        {currentScreen === 'booking_summary' && (
          <BookingSummaryScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            selectedCrop={selectedCrop}
            acres={selectedAcres}
            selectedServices={selectedServices}
            totalAmount={totalBookingAmount}
            farmerAddress={`Dundigam Village, Nellore District, Andhra Pradesh`}
            onProceedToPayment={_meta => {
              // Proceeding to payment
            }}
          />
        )}

        {currentScreen === 'payment' && (
          <PaymentScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            totalAmount={totalBookingAmount}
            walletBalance={walletBalance}
            onCompletePayment={handleCompletePayment}
          />
        )}

        {currentScreen === 'tracking' && (
          <LiveTrackingScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            booking={activeTrackingBooking}
            onVerifyOtp={handleVerifyOtp}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'bookings' && (
          <BookingsScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            bookings={bookings}
            onSelectBookingForTracking={b => setActiveTrackingBooking(b)}
          />
        )}

        {currentScreen === 'store' && (
          <AgriStoreScreen
            lang={lang}
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentScreen === 'support' && (
          <ExpertSupportScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'wallet' && (
          <WalletScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            balance={walletBalance}
            transactions={transactions}
            onAddMoney={handleAddMoney}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            farmerName={farmerName}
            farmerPhone={farmerPhone}
            selectedDistrict={selectedDistrict}
            persona={persona}
            onChangePersona={handlePersonaChange}
            onToggleLang={toggleLanguage}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'provider' && (
          <ProviderScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            persona={persona}
            onChangePersona={handlePersonaChange}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'admin' && (
          <AdminDashboardScreen
            lang={lang}
            onNavigate={setCurrentScreen}
            onChangePersona={handlePersonaChange}
            onShowToast={showToast}
          />
        )}
      </div>

      {/* 4. Bottom Tab Navigation Bar */}
      <BottomTabBar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        lang={lang}
        bookingCount={bookings.filter(b => b.status === 'ONGOING' || b.status === 'PENDING').length}
      />

      {/* 5. Cart Drawer Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        lang={lang}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={() => setCartItems([])}
        onCheckout={handleCartCheckout}
      />

      {/* 6. Notifications Modal Dropdown */}
      {isNotificationsOpen && (
        <div className="modal-backdrop" onClick={() => setIsNotificationsOpen(false)}>
          <div className="modal-dialog notif-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{lang === 'te' ? 'నోటిఫికేషన్లు' : 'Notifications'}</h3>
              <button type="button" className="close-btn" onClick={() => setIsNotificationsOpen(false)}>✕</button>
            </div>
            <div className="modal-body notif-body">
              <div className="notif-item unread">
                <span className="notif-icon">🚜</span>
                <div>
                  <strong>{lang === 'te' ? 'ట్రాక్టర్ బయలుదేరింది' : 'Tractor Dispatched'}</strong>
                  <p>{lang === 'te' ? 'కాప నాని ట్రాక్టర్‌తో మీ డుండిగం పొలానికి వస్తున్నారు (20 నిమిషాలు).' : 'Kapa Nani is en route to your Dundigam Village paddy field with Mahindra 575 DI.'}</p>
                  <span className="notif-time">10 mins ago</span>
                </div>
              </div>
              <div className="notif-item">
                <span className="notif-icon">🚁</span>
                <div>
                  <strong>{lang === 'te' ? 'డ్రోన్ స్ప్రేయింగ్ 20% ఆఫర్' : 'Drone Spraying Special Discount'}</strong>
                  <p>{lang === 'te' ? 'కోడ్ KISAN20 ఉపయోగించి 20% ఆదా చేయండి.' : 'Get 20% off on your next pesticide spray using coupon KISAN20.'}</p>
                  <span className="notif-time">2 hours ago</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setIsNotificationsOpen(false)}
              >
                {lang === 'te' ? 'మూసివేయండి' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Floating Toast Alerts */}
      <div className="floating-toasts-stack">
        {toasts.map(t => (
          <div key={t.id} className="app-toast-pill">
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </MobileFrame>
  );
}
