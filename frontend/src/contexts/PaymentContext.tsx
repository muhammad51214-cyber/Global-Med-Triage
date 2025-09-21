import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  method: 'card' | 'crypto' | 'apple' | 'google';
  serviceType: 'emergency' | 'premium' | 'enterprise';
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  orderId?: string;
}

interface PaymentContextType {
  payments: PaymentData[];
  currentPayment: PaymentData | null;
  isPaymentRequired: boolean;
  requiredServiceType: 'emergency' | 'premium' | 'enterprise' | null;
  addPayment: (payment: PaymentData) => void;
  setPaymentRequired: (required: boolean, serviceType?: 'emergency' | 'premium' | 'enterprise') => void;
  clearCurrentPayment: () => void;
  hasActiveSubscription: (serviceType: 'emergency' | 'premium' | 'enterprise') => boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [currentPayment, setCurrentPayment] = useState<PaymentData | null>(null);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [requiredServiceType, setRequiredServiceType] = useState<'emergency' | 'premium' | 'enterprise' | null>(null);

  // Load payments from localStorage on mount
  useEffect(() => {
    const savedPayments = localStorage.getItem('globalmed-payments');
    if (savedPayments) {
      try {
        const parsedPayments = JSON.parse(savedPayments).map((payment: any) => ({
          ...payment,
          timestamp: new Date(payment.timestamp)
        }));
        setPayments(parsedPayments);
      } catch (error) {
        console.error('Error loading payments from localStorage:', error);
      }
    }
  }, []);

  // Save payments to localStorage whenever payments change
  useEffect(() => {
    localStorage.setItem('globalmed-payments', JSON.stringify(payments));
  }, [payments]);

  const addPayment = (payment: PaymentData) => {
    setPayments(prev => [...prev, payment]);
    setCurrentPayment(payment);
    
    // Clear payment requirement if this payment covers the required service
    if (requiredServiceType && payment.serviceType === requiredServiceType && payment.status === 'completed') {
      setIsPaymentRequired(false);
      setRequiredServiceType(null);
    }
  };

  const setPaymentRequired = (required: boolean, serviceType?: 'emergency' | 'premium' | 'enterprise') => {
    setIsPaymentRequired(required);
    setRequiredServiceType(serviceType || null);
  };

  const clearCurrentPayment = () => {
    setCurrentPayment(null);
  };

  const hasActiveSubscription = (serviceType: 'emergency' | 'premium' | 'enterprise'): boolean => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return payments.some(payment => 
      payment.serviceType === serviceType &&
      payment.status === 'completed' &&
      payment.timestamp > thirtyDaysAgo
    );
  };

  const value: PaymentContextType = {
    payments,
    currentPayment,
    isPaymentRequired,
    requiredServiceType,
    addPayment,
    setPaymentRequired,
    clearCurrentPayment,
    hasActiveSubscription
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
