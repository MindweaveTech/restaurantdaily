'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChefHat, Building2, ExternalLink, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, MapPin, Phone, Mail, Info, FileCheck, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLayout, LoadingScreen, ErrorScreen } from '@/components/ui/page-layout';
import { GlassCard, GlassInput, GlassTextarea, GlassSelect, GlassButton, GlassNotice, GlassIconBadge } from '@/components/ui/glass-card';

export default function RestaurantSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // Form state
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    address: '',
    googleMapsLink: '',
    description: '',
    cuisine: '',
    phone: '',
    email: '',
    // KYC fields (required for Indian restaurants)
    gstNumber: '',
    fssaiNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Role validation - ensure only admin users can access restaurant setup
  useEffect(() => {
    const validateUserRole = () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setRoleError('Authentication required. Please log in first.');
        setTimeout(() => router.push('/auth/phone'), 2000);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.role !== 'business_admin' && payload.role !== 'admin') {
          setRoleError(
            payload.role === 'employee' || payload.role === 'staff'
              ? 'Staff members cannot create restaurants. Only restaurant admins can set up new restaurants.'
              : 'Invalid role. Only restaurant admins can create restaurants.'
          );
          setTimeout(() => {
            // Redirect staff to their appropriate onboarding
            if (payload.role === 'employee' || payload.role === 'staff') {
              router.push('/onboarding/staff-welcome');
            } else {
              router.push('/auth/role-selection');
            }
          }, 3000);
          return;
        }

        // Valid admin user
        setIsValidating(false);
      } catch (error) {
        console.error('Token validation error:', error);
        setRoleError('Invalid authentication token. Please log in again.');
        setTimeout(() => router.push('/auth/phone'), 2000);
      }
    };

    validateUserRole();
  }, [router]);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!restaurantData.name.trim()) {
        newErrors.name = 'Restaurant name is required';
      }
      if (!restaurantData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    }

    if (currentStep === 2) {
      // GST validation (15 characters: 2 state code + 10 PAN + 1 entity + 1 default + 1 checksum)
      if (!restaurantData.gstNumber.trim()) {
        newErrors.gstNumber = 'GST number is required for business verification';
      } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(restaurantData.gstNumber.trim())) {
        newErrors.gstNumber = 'Please enter a valid 15-character GST number';
      }

      // FSSAI validation (14 digits)
      if (!restaurantData.fssaiNumber.trim()) {
        newErrors.fssaiNumber = 'FSSAI license number is required for food businesses';
      } else if (!/^\d{14}$/.test(restaurantData.fssaiNumber.trim())) {
        newErrors.fssaiNumber = 'Please enter a valid 14-digit FSSAI license number';
      }
    }

    if (currentStep === 3) {
      if (restaurantData.phone && !/^\+?[\d\s-()]+$/.test(restaurantData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (restaurantData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(restaurantData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setRestaurantData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleNext = () => {
    // Clear submit errors when moving to next step
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }

    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(step)) return;

    setLoading(true);

    try {
      const authToken = localStorage.getItem('auth_token');

      const response = await fetch('/api/restaurant/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(restaurantData),
      });

      const data = await response.json();

      if (response.ok) {
        // Update token with restaurant information
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        // Redirect to admin dashboard
        router.push('/dashboard/admin');
      } else {
        console.error('Failed to create restaurant:', data.error);
        setErrors({ submit: data.error || 'Failed to create restaurant. Please try again.' });
      }
    } catch (error) {
      console.error('Restaurant setup error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const cuisineOptions = [
    { value: 'indian', label: 'Indian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'italian', label: 'Italian' },
    { value: 'continental', label: 'Continental' },
    { value: 'fast-food', label: 'Fast Food' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'other', label: 'Other' },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium border-2 transition-all',
            stepNumber < step
              ? 'bg-orange-500 border-orange-500 text-white'
              : stepNumber === step
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-white/5 border-white/20 text-white/40'
          )}>
            {stepNumber < step ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              stepNumber
            )}
          </div>
          {stepNumber < 4 && (
            <div className={cn(
              'w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all',
              stepNumber < step ? 'bg-orange-500' : 'bg-white/20'
            )} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GlassIconBadge icon={<Building2 className="h-8 w-8" />} variant="orange" size="lg" />
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">
          Restaurant Details
        </h2>
        <p className="text-white/60">
          Let&apos;s start with your restaurant&apos;s basic information
        </p>
      </div>

      <div className="space-y-5">
        <GlassInput
          label="Restaurant Name *"
          value={restaurantData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., The Golden Fork"
          error={!!errors.name}
          errorMessage={errors.name}
        />

        <GlassTextarea
          label="Address *"
          value={restaurantData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter your restaurant's full address"
          rows={3}
          error={!!errors.address}
          errorMessage={errors.address}
        />

        <GlassInput
          label="Google Maps Link"
          value={restaurantData.googleMapsLink}
          onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
          placeholder="https://maps.google.com/..."
          helperText="Optional: Help customers find you easily"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GlassIconBadge icon={<Shield className="h-8 w-8" />} variant="orange" size="lg" />
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">
          Business Verification
        </h2>
        <p className="text-white/60">
          Enter your GST and FSSAI details for KYC verification
        </p>
      </div>

      <div className="space-y-5">
        <GlassInput
          label="GST Number *"
          value={restaurantData.gstNumber}
          onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
          placeholder="22AAAAA0000A1Z5"
          error={!!errors.gstNumber}
          errorMessage={errors.gstNumber}
          helperText="15-character GST Identification Number"
        />

        <GlassInput
          label="FSSAI License Number *"
          value={restaurantData.fssaiNumber}
          onChange={(e) => handleInputChange('fssaiNumber', e.target.value.replace(/\D/g, ''))}
          placeholder="12345678901234"
          error={!!errors.fssaiNumber}
          errorMessage={errors.fssaiNumber}
          helperText="14-digit FSSAI license number (mandatory for food businesses)"
        />
      </div>

      <GlassNotice variant="info" icon={<FileCheck className="h-4 w-4" />} title="Why we need this">
        <p className="text-sm text-white/60 mt-1">
          GST and FSSAI verification helps us ensure compliance with Indian food safety regulations
          and enables features like automated tax invoicing.
        </p>
      </GlassNotice>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GlassIconBadge icon={<ChefHat className="h-8 w-8" />} variant="orange" size="lg" />
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">
          Additional Information
        </h2>
        <p className="text-white/60">
          Tell us more about your restaurant (optional)
        </p>
      </div>

      <div className="space-y-5">
        <GlassSelect
          label="Cuisine Type"
          value={restaurantData.cuisine}
          onChange={(e) => handleInputChange('cuisine', e.target.value)}
          options={cuisineOptions}
          placeholder="Select cuisine type"
        />

        <GlassInput
          label="Phone Number"
          type="tel"
          value={restaurantData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+91 98765 43210"
          error={!!errors.phone}
          errorMessage={errors.phone}
        />

        <GlassInput
          label="Email Address"
          type="email"
          value={restaurantData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="restaurant@example.com"
          error={!!errors.email}
          errorMessage={errors.email}
        />

        <GlassTextarea
          label="Description"
          value={restaurantData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of your restaurant..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GlassIconBadge icon={<CheckCircle className="h-8 w-8" />} variant="success" size="lg" />
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">
          Ready to Go!
        </h2>
        <p className="text-white/60">
          Review your restaurant information and complete setup
        </p>
      </div>

      <GlassCard size="md" variant="default" className="space-y-4">
        <div>
          <h3 className="font-semibold text-white text-lg">{restaurantData.name}</h3>
          <p className="text-white/60 text-sm mt-1 flex items-start gap-2">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            {restaurantData.address}
          </p>
        </div>

        {/* KYC Information */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center text-sm mb-2">
            <span className="text-white/50 w-20">GST:</span>
            <span className="text-white font-mono">{restaurantData.gstNumber}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-white/50 w-20">FSSAI:</span>
            <span className="text-white font-mono">{restaurantData.fssaiNumber}</span>
          </div>
        </div>

        {restaurantData.cuisine && (
          <div className="flex items-center text-sm">
            <span className="text-white/50 w-20">Cuisine:</span>
            <span className="text-white capitalize">{restaurantData.cuisine}</span>
          </div>
        )}

        {restaurantData.phone && (
          <div className="flex items-center text-sm">
            <span className="text-white/50 w-20">Phone:</span>
            <span className="text-white flex items-center gap-2">
              <Phone className="h-4 w-4 text-white/50" />
              {restaurantData.phone}
            </span>
          </div>
        )}

        {restaurantData.email && (
          <div className="flex items-center text-sm">
            <span className="text-white/50 w-20">Email:</span>
            <span className="text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-white/50" />
              {restaurantData.email}
            </span>
          </div>
        )}

        {restaurantData.googleMapsLink && (
          <div>
            <a
              href={restaurantData.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-400 hover:text-orange-300 inline-flex items-center gap-1 transition-colors"
            >
              View on Google Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </GlassCard>

      <GlassNotice variant="success" icon={<Info className="h-4 w-4" />} title="What's next?">
        <ul className="space-y-1 mt-2">
          <li>Access your restaurant admin dashboard</li>
          <li>Invite staff members to join your team</li>
          <li>Start tracking daily operations</li>
          <li>Manage cash sessions and vouchers</li>
        </ul>
      </GlassNotice>
    </div>
  );

  // Show loading screen while validating role
  if (isValidating) {
    return (
      <LoadingScreen
        message="Validating access..."
        subMessage="Checking your permissions"
      />
    );
  }

  // Show role error screen
  if (roleError) {
    return (
      <ErrorScreen
        title="Access Restricted"
        message={roleError}
        showHomeButton={false}
      />
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-xl flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo.svg"
              alt="Restaurant Daily"
              width={40}
              height={40}
              className="w-10 h-10 mr-3"
            />
            <span className="text-2xl font-bold text-white">Restaurant Daily</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Restaurant Setup
          </h1>

          <p className="text-white/60">
            Let&apos;s set up your restaurant profile
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Content */}
        <GlassCard size="lg" variant="orange" className="flex-1 flex flex-col">
          {/* Step Content */}
          <div className="flex-1">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>

          {/* Error Display */}
          {errors.submit && (
            <GlassNotice variant="error" icon={<AlertTriangle className="h-4 w-4" />} className="mt-6">
              {errors.submit}
            </GlassNotice>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                step === 1
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <GlassButton
              onClick={handleNext}
              disabled={loading}
              loading={loading}
              rightIcon={step === 4 ? <CheckCircle className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            >
              {loading ? 'Creating...' : step === 4 ? 'Complete Setup' : 'Next'}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </PageLayout>
  );
}
