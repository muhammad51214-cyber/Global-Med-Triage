import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { createCrossmintOrder, createGlobalMedOrderData } from '../utils/crossmintApi';

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
  icon: string;
}

interface PaymentSystemProps {
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
  serviceType?: 'emergency' | 'premium' | 'enterprise';
}

export default function PaymentSystem({ 
  onPaymentSuccess, 
  onPaymentError, 
  serviceType = 'emergency' 
}: PaymentSystemProps) {
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'apple' | 'google'>('card');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'basic',
      name: 'Basic Emergency',
      description: 'Essential emergency dispatch services',
      price: 29.99,
      currency: 'USD',
      features: [
        '24/7 Emergency Dispatch',
        'Multi-language Support',
        'Basic AI Triage',
        'Standard Response Time',
        'Email Support'
      ],
      icon: '🚨'
    },
    {
      id: 'premium',
      name: 'Premium Dispatch',
      description: 'Advanced emergency services with priority support',
      price: 79.99,
      currency: 'USD',
      features: [
        'Priority Emergency Dispatch',
        'Real-time Translation',
        'Advanced AI Triage',
        'Fast Response Time (<2s)',
        'Live Chat Support',
        'Custom Integrations',
        'Analytics Dashboard'
      ],
      popular: true,
      icon: '⭐'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Solution',
      description: 'Complete emergency management system',
      price: 199.99,
      currency: 'USD',
      features: [
        'Unlimited Emergency Dispatch',
        'Multi-language AI',
        'Advanced AI Triage',
        'Instant Response Time',
        '24/7 Phone Support',
        'Custom Integrations',
        'Advanced Analytics',
        'White-label Solution',
        'API Access',
        'Dedicated Account Manager'
      ],
      icon: '🏢'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    const plan = paymentPlans.find(p => p.id === selectedPlan);
    
    try {
      console.log('Processing payment with Crossmint...');
      
      // Create order data using the utility function
      const orderData = createGlobalMedOrderData(
        plan?.price || 0,
        plan?.currency || 'USD',
        paymentMethod,
        serviceType
      );

      // Create Crossmint order using the secure API utility
      const result = await createCrossmintOrder(orderData);
      
      // Handle successful payment
      const paymentData = {
        orderId: result.id,
        plan: plan,
        amount: plan?.price,
        currency: plan?.currency,
        paymentMethod: paymentMethod,
        timestamp: new Date(),
        status: 'completed'
      };

      onPaymentSuccess?.(paymentData);

      setShowPaymentModal(false);
      setSelectedPlan('');
      
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getServiceTypeTitle = () => {
    switch (serviceType) {
      case 'emergency': return 'Emergency Dispatch Services';
      case 'premium': return 'Premium Dispatch Services';
      case 'enterprise': return 'Enterprise Solutions';
      default: return 'Emergency Services';
    }
  };

  const getServiceTypeDescription = () => {
    switch (serviceType) {
      case 'emergency': return 'Choose your emergency dispatch service plan';
      case 'premium': return 'Upgrade to premium emergency services';
      case 'enterprise': return 'Enterprise-grade emergency management';
      default: return 'Select your service plan';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xl">💳</span>
          </div>
          <h2 className={`text-3xl font-bold transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            {getServiceTypeTitle()}
          </h2>
        </div>
        <p className={`text-lg transition-colors duration-300 ${
          theme === 'light' ? 'text-slate-600' : 'text-white/70'
        }`}>
          {getServiceTypeDescription()}
        </p>
      </div>

      {/* Payment Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
              plan.popular
                ? 'border-blue-500 shadow-xl shadow-blue-500/20'
                : theme === 'light'
                  ? 'border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl'
                  : 'border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl'
            } ${
              theme === 'light' 
                ? 'bg-white hover:bg-slate-50' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{plan.icon}</div>
              <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>
                {plan.name}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>
                {plan.description}
              </p>
            </div>

            <div className="text-center mb-6">
              <div className={`text-4xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>
                ${plan.price}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>
                per month
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`text-sm transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-700' : 'text-white/90'
                  }`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400 shadow-lg hover:shadow-xl'
                  : theme === 'light'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-800'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 transition-colors duration-300 ${
            theme === 'light' 
              ? 'bg-white border border-slate-200 shadow-2xl' 
              : 'bg-slate-800 border border-white/20 shadow-2xl'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>
                Complete Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  theme === 'light' 
                    ? 'hover:bg-slate-100 text-slate-600' 
                    : 'hover:bg-white/10 text-white/70'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {selectedPlan && (
              <div className="mb-6">
                <div className={`p-4 rounded-xl border transition-colors duration-300 ${
                  theme === 'light' 
                    ? 'bg-slate-50 border-slate-200' 
                    : 'bg-white/5 border-white/20'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {paymentPlans.find(p => p.id === selectedPlan)?.icon}
                    </span>
                    <div>
                      <div className={`font-semibold transition-colors duration-300 ${
                        theme === 'light' ? 'text-slate-800' : 'text-white'
                      }`}>
                        {paymentPlans.find(p => p.id === selectedPlan)?.name}
                      </div>
                      <div className={`text-sm transition-colors duration-300 ${
                        theme === 'light' ? 'text-slate-600' : 'text-white/70'
                      }`}>
                        ${paymentPlans.find(p => p.id === selectedPlan)?.price}/month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="mb-6">
              <h4 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-700' : 'text-white/90'
              }`}>
                Payment Method
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'card', label: 'Credit Card', icon: '💳' },
                  { id: 'crypto', label: 'Crypto', icon: '₿' },
                  { id: 'apple', label: 'Apple Pay', icon: '🍎' },
                  { id: 'google', label: 'Google Pay', icon: 'G' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : theme === 'light'
                          ? 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                          : 'border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      theme === 'light' ? 'text-slate-700' : 'text-white/90'
                    }`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                isProcessing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-400 hover:to-blue-400 shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                `Pay $${paymentPlans.find(p => p.id === selectedPlan)?.price}`
              )}
            </button>

            <p className={`text-xs text-center mt-4 transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-500' : 'text-white/50'
            }`}>
              Secure payment powered by Crossmint
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
