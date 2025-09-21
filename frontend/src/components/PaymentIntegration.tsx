import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface PaymentIntegrationProps {
  onPaymentComplete: (success: boolean, data?: any) => void;
  serviceType: 'emergency' | 'premium' | 'enterprise';
  amount?: number;
  description?: string;
  compact?: boolean;
}

export default function PaymentIntegration({
  onPaymentComplete,
  serviceType,
  amount,
  description,
  compact = false
}: PaymentIntegrationProps) {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handleQuickPayment = async (paymentMethod: 'card' | 'crypto' | 'apple' | 'google') => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      const paymentData = {
        id: `pay_${Date.now()}`,
        amount: amount || 29.99,
        currency: 'USD',
        method: paymentMethod,
        serviceType,
        timestamp: new Date(),
        status: 'completed'
      };
      
      onPaymentComplete(true, paymentData);
    } catch (error) {
      onPaymentComplete(false, { error: 'Payment failed' });
    } finally {
      setIsProcessing(false);
      setShowPaymentOptions(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowPaymentOptions(true)}
          disabled={isProcessing}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            isProcessing
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-400 hover:to-blue-400 shadow-lg hover:shadow-xl'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>💳</span>
              <span>Pay ${amount || 29.99}</span>
            </div>
          )}
        </button>

        {showPaymentOptions && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <div className={`w-64 rounded-xl p-4 shadow-2xl border transition-colors duration-300 ${
              theme === 'light' 
                ? 'bg-white border-slate-200' 
                : 'bg-slate-800 border-white/20'
            }`}>
              <h4 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-700' : 'text-white/90'
              }`}>
                Choose Payment Method
              </h4>
              <div className="space-y-2">
                {[
                  { id: 'card', label: 'Credit Card', icon: '💳' },
                  { id: 'crypto', label: 'Crypto', icon: '₿' },
                  { id: 'apple', label: 'Apple Pay', icon: '🍎' },
                  { id: 'google', label: 'Google Pay', icon: 'G' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleQuickPayment(method.id as any)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                      theme === 'light'
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-white/10 text-white/90'
                    }`}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 border transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-white/80 border-slate-200 shadow-lg' 
        : 'bg-white/5 border-white/10'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
          <span className="text-white text-lg">💳</span>
        </div>
        <div>
          <h3 className={`text-lg font-semibold transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            Payment Required
          </h3>
          <p className={`text-sm transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-600' : 'text-white/70'
          }`}>
            {description || 'Complete payment to access premium services'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className={`text-2xl font-bold transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            ${amount || 29.99}
          </div>
          <div className={`text-sm transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-600' : 'text-white/70'
          }`}>
            {serviceType} service
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-600' : 'text-white/70'
          }`}>
            Secure payment
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-500">🔒</span>
            <span className={`text-xs transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-500' : 'text-white/50'
            }`}>
              Crossmint
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'card', label: 'Credit Card', icon: '💳', color: 'from-blue-500 to-indigo-500' },
          { id: 'crypto', label: 'Crypto', icon: '₿', color: 'from-orange-500 to-yellow-500' },
          { id: 'apple', label: 'Apple Pay', icon: '🍎', color: 'from-gray-500 to-gray-600' },
          { id: 'google', label: 'Google Pay', icon: 'G', color: 'from-red-500 to-pink-500' }
        ].map((method) => (
          <button
            key={method.id}
            onClick={() => handleQuickPayment(method.id as any)}
            disabled={isProcessing}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
              isProcessing
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 shadow-lg hover:shadow-xl'
            } ${
              theme === 'light'
                ? 'bg-white border-slate-200 hover:border-slate-300'
                : 'bg-white/5 border-white/20 hover:border-white/30'
            }`}
          >
            <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center`}>
              <span className="text-white text-lg">{method.icon}</span>
            </div>
            <div className="text-left">
              <div className={`font-medium transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>
                {method.label}
              </div>
              <div className={`text-xs transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-500' : 'text-white/50'
              }`}>
                Instant payment
              </div>
            </div>
          </button>
        ))}
      </div>

      {isProcessing && (
        <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span className={`text-sm font-medium transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-700' : 'text-white/90'
            }`}>
              Processing payment...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
