'use client';

import { useState, useEffect, forwardRef } from 'react';
import { Phone, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { PhoneValidator } from '@/lib/messaging/phone-validator';
import { cn } from '@/lib/utils';

interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
];

export interface PhoneInputProps {
  value?: string;
  onChange?: (phone: string, isValid: boolean) => void;
  onValidation?: (result: { isValid: boolean; formatted?: string; error?: string }) => void;
  placeholder?: string;
  defaultCountry?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  loading?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({
  value = '',
  onChange,
  onValidation,
  placeholder = 'Enter phone number',
  defaultCountry = 'IN',
  disabled = false,
  required = false,
  className,
  error,
  loading = false,
}, ref) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [showCountryList, setShowCountryList] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(value);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    formatted?: string;
    error?: string;
  }>({ isValid: false });

  // Update local state when external value changes
  useEffect(() => {
    if (value !== phoneNumber) {
      setPhoneNumber(value);
    }
  }, [value]);

  // Validate phone number on change
  useEffect(() => {
    if (!phoneNumber.trim()) {
      const result = { isValid: false };
      setValidationResult(result);
      onValidation?.(result);
      onChange?.(phoneNumber, false);
      return;
    }

    const result = PhoneValidator.validate(phoneNumber, selectedCountry.code);
    setValidationResult(result);
    onValidation?.(result);
    onChange?.(result.formatted || phoneNumber, result.isValid);
  }, [phoneNumber, selectedCountry.code, onChange, onValidation]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPhoneNumber(newValue);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryList(false);

    // If there's already a number, re-validate with new country
    if (phoneNumber.trim()) {
      const result = PhoneValidator.validate(phoneNumber, country.code);
      setValidationResult(result);
      onValidation?.(result);
      onChange?.(result.formatted || phoneNumber, result.isValid);
    }
  };

  const getInputBorderColor = () => {
    if (error || (phoneNumber.trim() && !validationResult.isValid)) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    }
    if (phoneNumber.trim() && validationResult.isValid) {
      return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    }
    return 'border-gray-300 focus:border-orange-500 focus:ring-orange-500';
  };

  const displayError = error || (phoneNumber.trim() && !validationResult.isValid ? validationResult.error : undefined);

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {/* Country Selector */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            type="button"
            onClick={() => !disabled && setShowCountryList(!showCountryList)}
            disabled={disabled}
            className={cn(
              'flex items-center px-3 py-2 border-r border-gray-300 h-full rounded-l-lg',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
              'transition-colors duration-200'
            )}
            aria-label={`Selected country: ${selectedCountry.name}`}
            aria-expanded={showCountryList}
            aria-haspopup="listbox"
          >
            <span className="text-lg mr-1">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700 mr-1">
              {selectedCountry.dial}
            </span>
            <ChevronDown className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              showCountryList && 'transform rotate-180'
            )} />
          </button>

          {/* Country Dropdown */}
          {showCountryList && !disabled && (
            <div className="absolute top-full left-0 z-50 w-64 bg-white border border-gray-300 rounded-md shadow-lg mt-1">
              <ul className="py-1 max-h-60 overflow-auto" role="listbox" aria-label="Select country">
                {COUNTRIES.map((country) => (
                  <li key={country.code}>
                    <button
                      type="button"
                      className={cn(
                        'w-full flex items-center px-3 py-2 text-sm hover:bg-orange-50 focus:bg-orange-50 focus:outline-none',
                        selectedCountry.code === country.code && 'bg-orange-100 text-orange-900'
                      )}
                      onClick={() => handleCountrySelect(country)}
                      role="option"
                      aria-selected={selectedCountry.code === country.code}
                    >
                      <span className="text-lg mr-3">{country.flag}</span>
                      <div className="flex-1 text-left">
                        <span className="font-medium">{country.name}</span>
                        <span className="ml-2 text-gray-500">{country.dial}</span>
                      </div>
                      {selectedCountry.code === country.code && (
                        <Check className="h-4 w-4 text-orange-600" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Phone Input */}
        <input
          ref={ref}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          data-testid="phone-input"
          className={cn(
            'block w-full pl-24 pr-10 py-2 border rounded-lg',
            'focus:ring-2 focus:ring-offset-0 focus:outline-none',
            'placeholder-gray-400 text-gray-900',
            'transition-all duration-200',
            getInputBorderColor(),
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            'text-base sm:text-sm'
          )}
          aria-describedby={displayError ? 'phone-error' : undefined}
          aria-invalid={!!displayError}
        />

        {/* Status Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600" />
          ) : phoneNumber.trim() && validationResult.isValid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : displayError ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Phone className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <p id="phone-error" className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {displayError}
        </p>
      )}

      {/* Success Message */}
      {phoneNumber.trim() && validationResult.isValid && validationResult.formatted && !displayError && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <Check className="h-4 w-4 mr-1" />
          Valid number: {PhoneValidator.formatForDisplay(validationResult.formatted)}
        </p>
      )}

      {/* Help Text */}
      {!phoneNumber.trim() && !displayError && (
        <p className="mt-2 text-sm text-gray-500">
          Enter your mobile number to receive verification code via SMS
        </p>
      )}
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;