import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePayment } from '../contexts/PaymentContext';
import { createCrossmintOrder, createGlobalMedOrderData } from '../utils/crossmintApi';

interface CrossmintGatewayProps {
  amount: number;
  currency: string;
  serviceType: 'emergency' | 'premium' | 'enterprise';
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function CrossmintGateway({
  amount,
  currency,
  serviceType,
  onSuccess,
  onError,
  onCancel
}: CrossmintGatewayProps) {
  const { theme } = useTheme();
  const { addPayment } = usePayment();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'apple' | 'google'>('card');
  const [step, setStep] = useState<'method' | 'processing' | 'success' | 'error'>('method');

  const processCrossmintOrder = async () => {
    setIsLoading(true);
    setStep('processing');

    try {
      console.log('Processing Crossmint payment...');
      
      // Create order data using the utility function
      const orderData = createGlobalMedOrderData(
        amount,
        currency,
        paymentMethod,
        serviceType
      );

      // Create Crossmint order using the secure API utility
      const result = await createCrossmintOrder(orderData);
      
      // Create payment data
      const paymentData = {
        id: result.id,
        amount: amount,
        currency: currency,
        method: paymentMethod,
        serviceType: serviceType,
        timestamp: new Date(),
        status: 'completed' as const,
        orderId: result.id
      };

      // Add to payment context
      addPayment(paymentData);
      
      setStep('success');
      onSuccess(paymentData);
      
    } catch (error) {
      console.error('Crossmint payment error:', error);
      setStep('error');
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'emergency': return '🚨';
      case 'premium': return '⭐';
      case 'enterprise': return '🏢';
      default: return '💳';
    }
  };

  const getServiceName = () => {
    switch (serviceType) {
      case 'emergency': return 'Emergency Dispatch';
      case 'premium': return 'Premium Services';
      case 'enterprise': return 'Enterprise Solution';
      default: return 'Service';
    }
  };

  if (step === 'processing') {
    return (
      <div className={`rounded-xl p-8 text-center transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white border border-slate-200 shadow-lg' 
          : 'bg-white/5 border border-white/20'
      }`}>
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
          <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
          theme === 'light' ? 'text-slate-800' : 'text-white'
        }`}>
          Processing Payment
        </h3>
        <p className={`transition-colors duration-300 ${
          theme === 'light' ? 'text-slate-600' : 'text-white/70'
        }`}>
          Please wait while we process your payment...
        </p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className={`rounded-xl p-8 text-center transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white border border-slate-200 shadow-lg' 
          : 'bg-white/5 border border-white/20'
      }`}>
        <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
          theme === 'light' ? 'text-slate-800' : 'text-white'
        }`}>
          Payment Successful!
        </h3>
        <p className={`transition-colors duration-300 ${
          theme === 'light' ? 'text-slate-600' : 'text-white/70'
        }`}>
          Your {getServiceName()} subscription is now active.
        </p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className={`rounded-xl p-8 text-center transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white border border-red-200 shadow-lg' 
          : 'bg-red-500/10 border border-red-500/20'
      }`}>
        <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
          theme === 'light' ? 'text-slate-800' : 'text-white'
        }`}>
          Payment Failed
        </h3>
        <p className={`transition-colors duration-300 ${
          theme === 'light' ? 'text-slate-600' : 'text-white/70'
        }`}>
          There was an error processing your payment. Please try again.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setStep('method')}
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors duration-300"
          >
            Try Again
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-slate-500 text-white rounded-lg hover:bg-slate-400 transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-white border border-slate-200 shadow-lg' 
        : 'bg-white/5 border border-white/20'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
          <span className="text-white text-xl">{getServiceIcon()}</span>
        </div>
        <div>
          <h3 className={`text-lg font-semibold transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            {getServiceName()}
          </h3>
          <p className={`text-sm transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-600' : 'text-white/70'
          }`}>
            Secure payment powered by Crossmint
          </p>
        </div>
      </div>

      {/* Amount */}
      <div className={`p-4 rounded-lg mb-6 transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-slate-50 border border-slate-200' 
          : 'bg-white/5 border border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`font-medium transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-700' : 'text-white/90'
          }`}>
            Total Amount
          </span>
          <span className={`text-2xl font-bold transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            ${amount} {currency}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h4 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
          theme === 'light' ? 'text-slate-700' : 'text-white/90'
        }`}>
          Choose Payment Method
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'card', label: 'Credit Card', icon: '💳', color: 'from-blue-500 to-indigo-500' },
            { id: 'crypto', label: 'Crypto', icon: '₿', color: 'from-orange-500 to-yellow-500' },
            { id: 'apple', label: 'Apple Pay', icon: '🍎', color: 'from-gray-500 to-gray-600' },
            { id: 'google', label: 'Google Pay', icon: 'G', color: 'from-red-500 to-pink-500' }
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id as any)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                paymentMethod === method.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : theme === 'light'
                    ? 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    : 'border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                <span className="text-white text-sm">{method.icon}</span>
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-700' : 'text-white/90'
              }`}>
                {method.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={processCrossmintOrder}
          disabled={isLoading}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            isLoading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-400 hover:to-blue-400 shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading ? 'Processing...' : `Pay $${amount}`}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-lg font-medium transition-colors duration-300 border ${
            theme === 'light'
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              : 'bg-white/10 text-white/70 hover:bg-white/20 border-white/20'
          }"
        >
          Cancel
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2">
          <span className="text-green-500">🔒</span>
          <span className={`text-xs transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-600' : 'text-white/70'
          }`}>
            Your payment is secured by Crossmint's enterprise-grade security
          </span>
        </div>
      </div>
    </div>
  );
}
