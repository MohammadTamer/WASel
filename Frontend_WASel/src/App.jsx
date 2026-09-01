import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import Navbar from './components/common/Navbar';

// Auth Components
import AuthModal from './components/auth/AuthModal';

// Customer Components
import CustomerHome from './components/customer/CustomerHome';
import StoreDetailView from './components/customer/StoreDetailView';
import CartDrawer from './components/customer/CartDrawer';
import CustomerOrdersView from './components/customer/CustomerOrdersView';
import AddressesView from './components/customer/AddressesView';

// Store Components
import StoreOwnerPortal from './components/store/StoreOwnerPortal';

// Driver Components
import DriverPortal from './components/driver/DriverPortal';

// Admin Components
import AdminPortal from './components/admin/AdminPortal';

function MainApp() {
  const { user, t } = useAuth();
  const { totalItemsCount, setIsDrawerOpen } = useCart();

  const [activeTab, setActiveTab] = useState('home');
  const [selectedStore, setSelectedStore] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync tab when user role changes
  React.useEffect(() => {
    if (user?.role === 'STORE_OWNER') {
      setActiveTab('store-orders');
    } else if (user?.role === 'DRIVER') {
      setActiveTab('driver-available');
    } else if (user?.role === 'ADMIN') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('home');
    }
  }, [user?.role]);

  const handleSelectStore = (store) => {
    setSelectedStore(store);
  };

  const handleBackToStores = () => {
    setSelectedStore(null);
  };

  const handleOrderSuccess = () => {
    setSelectedStore(null);
    setActiveTab('orders');
  };

  return (
    <div className="app-container">
      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') setSelectedStore(null);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace / View Content */}
      <main className="main-content">
        {/* 1. STORE OWNER PORTAL */}
        {user?.role === 'STORE_OWNER' && (
          <StoreOwnerPortal activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* 2. DRIVER PORTAL */}
        {user?.role === 'DRIVER' && (
          <DriverPortal activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* 3. ADMIN PORTAL */}
        {user?.role === 'ADMIN' && (
          <AdminPortal activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* 4. CUSTOMER / GUEST PORTAL */}
        {(!user || user.role === 'CUSTOMER') && (
          <>
            {activeTab === 'home' && (
              selectedStore ? (
                <StoreDetailView 
                  store={selectedStore} 
                  onBack={handleBackToStores} 
                  onOpenAuth={() => setIsAuthModalOpen(true)} 
                />
              ) : (
                <CustomerHome onSelectStore={handleSelectStore} />
              )
            )}

            {activeTab === 'orders' && (
              <CustomerOrdersView onReorderSuccess={() => setActiveTab('orders')} />
            )}

            {activeTab === 'addresses' && (
              <AddressesView />
            )}
          </>
        )}
      </main>

      {/* Floating Cart Button for Logged-In Customers */}
      {user && user.role === 'CUSTOMER' && totalItemsCount > 0 && (
        <button 
          className="cart-floating-btn"
          onClick={() => setIsDrawerOpen(true)}
          title={t('cartTitle')}
        >
          <span>{t('floatingCart')} ({totalItemsCount})</span>
        </button>
      )}

      {/* Cart Drawer Panel (Only For Logged-In Customers) */}
      {user && user.role === 'CUSTOMER' && (
        <CartDrawer 
          onOrderSuccess={handleOrderSuccess}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
