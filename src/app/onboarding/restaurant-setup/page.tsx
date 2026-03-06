'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Building2, ExternalLink, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

        // Accept both 'admin' and 'business_admin' as valid roles for restaurant setup
        if (payload.role !== 'admin' && payload.role !== 'business_admin') {
          setRoleError(
            payload.role === 'staff' || payload.role === 'employee'
              ? 'Staff members cannot create restaurants. Only restaurant admins can set up new restaurants.'
              : 'Invalid role. Only restaurant admins can create restaurants.'
          );
          setTimeout(() => {
            // Redirect staff to their appropriate onboarding
            if (payload.role === 'staff' || payload.role === 'employee') {
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
      if (step < 3) {
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
            stepNumber <= step
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-500'
          )}>
            {stepNumber < step ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              stepNumber
            )}
          </div>
          {stepNumber < 3 && (
            <div className={cn(
              'w-16 h-0.5 mx-2',
              stepNumber < step ? 'bg-orange-600' : 'bg-gray-200'
            )} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
          <Building2 className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Restaurant Details
        </h2>
        <p className="text-gray-600">
          Let&apos;s start with your restaurant&apos;s basic information
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Name *
          </label>
          <input
            type="text"
            value={restaurantData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., The Golden Fork"
            className={cn(
              'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500',
              errors.name ? 'border-red-300' : 'border-gray-300'
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            value={restaurantData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter your restaurant&apos;s full address"
            rows={3}
            className={cn(
              'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500',
              errors.address ? 'border-red-300' : 'border-gray-300'
            )}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Maps Link
          </label>
          <input
            type="url"
            value={restaurantData.googleMapsLink}
            onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
            placeholder="https://maps.google.com/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Optional: Help customers find you easily
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
          <ChefHat className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Additional Information
        </h2>
        <p className="text-gray-600">
          Tell us more about your restaurant (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine Type
          </label>
          <select
            value={restaurantData.cuisine}
            onChange={(e) => handleInputChange('cuisine', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select cuisine type</option>
            <option value="indian">Indian</option>
            <option value="chinese">Chinese</option>
            <option value="italian">Italian</option>
            <option value="continental">Continental</option>
            <option value="fast-food">Fast Food</option>
            <option value="cafe">Cafe</option>
            <option value="bakery">Bakery</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={restaurantData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={cn(
              'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500',
              errors.phone ? 'border-red-300' : 'border-gray-300'
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={restaurantData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="restaurant@example.com"
            className={cn(
              'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500',
              errors.email ? 'border-red-300' : 'border-gray-300'
            )}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={restaurantData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of your restaurant..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ready to Go!
        </h2>
        <p className="text-gray-600">
          Review your restaurant information and complete setup
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-medium text-gray-900">{restaurantData.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{restaurantData.address}</p>
        </div>

        {restaurantData.cuisine && (
          <div>
            <span className="text-sm font-medium text-gray-700">Cuisine: </span>
            <span className="text-sm text-gray-600 capitalize">{restaurantData.cuisine}</span>
          </div>
        )}

        {restaurantData.phone && (
          <div>
            <span className="text-sm font-medium text-gray-700">Phone: </span>
            <span className="text-sm text-gray-600">{restaurantData.phone}</span>
          </div>
        )}

        {restaurantData.email && (
          <div>
            <span className="text-sm font-medium text-gray-700">Email: </span>
            <span className="text-sm text-gray-600">{restaurantData.email}</span>
          </div>
        )}

        {restaurantData.googleMapsLink && (
          <div>
            <span className="text-sm font-medium text-gray-700">Maps: </span>
            <a
              href={restaurantData.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-700 inline-flex items-center"
            >
              View on Google Maps
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-medium text-orange-800 mb-2">What&apos;s next?</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Access your restaurant admin dashboard</li>
          <li>• Invite staff members to join your team</li>
          <li>• Start tracking daily operations</li>
          <li>• Manage cash sessions and vouchers</li>
        </ul>
      </div>
    </div>
  );

  // Show loading screen while validating role
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Validating access...</h2>
          <p className="text-gray-500 mt-2">Checking your permissions</p>
        </div>
      </div>
    );
  }

  // Show role error screen
  if (roleError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h2>

            <p className="text-gray-600 mb-6">
              {roleError}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-800 mb-2">Why can&apos;t I access this page?</h3>
              <p className="text-sm text-red-700">
                Restaurant setup is only available to restaurant administrators.
                Staff members have their own onboarding process and dashboard.
              </p>
            </div>

            <p className="text-sm text-gray-500">
              You will be redirected automatically in a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-orange-600 mr-3" />
            <span className="text-2xl font-bold text-gray-800">Restaurant Daily</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Restaurant Setup
          </h1>

          <p className="text-lg text-gray-600">
            Let&apos;s set up your restaurant profile
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step Content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-colors',
                step === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              )}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className={cn(
                'px-8 py-3 rounded-lg font-semibold flex items-center',
                'bg-orange-600 hover:bg-orange-700 text-white',
                'focus:outline-none focus:ring-2 focus:ring-orange-500',
                'transition-all duration-200 shadow-md hover:shadow-lg',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : step === 3 ? (
                <>
                  Complete Setup
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}