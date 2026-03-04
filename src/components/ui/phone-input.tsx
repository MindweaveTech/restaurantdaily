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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const displayError = error || (phoneNumber.trim() && !validationResult.isValid ? validationResult.error : undefined);

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-white/70 mb-2">
        Phone Number {required && <span className="text-orange-400">*</span>}
      </label>

      <div className="relative">
        {/* Country Selector */}
        <div className="absolute inset-y-0 left-0 flex items-center z-10">
          <button
            type="button"
            onClick={() => !disabled && setShowCountryList(!showCountryList)}
            disabled={disabled}
            className={cn(
              'flex items-center px-3 py-2 h-full rounded-l-xl',
              'bg-white/5 border-r border-white/10',
              'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-inset',
              disabled && 'opacity-50 cursor-not-allowed',
              'transition-all duration-200'
            )}
            aria-label={`Selected country: ${selectedCountry.name}`}
            aria-expanded={showCountryList}
            aria-haspopup="listbox"
          >
            <span className="text-lg mr-1">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-white/80 mr-1">
              {selectedCountry.dial}
            </span>
            <ChevronDown className={cn(
              'h-4 w-4 text-white/40 transition-transform duration-200',
              showCountryList && 'transform rotate-180'
            )} />
          </button>

          {/* Country Dropdown */}
          {showCountryList && !disabled && (
            <div className="absolute top-full left-0 z-50 w-64 bg-[#0a0a1a]/95 backdrop-blur-xl border border-orange-500/20 rounded-xl shadow-2xl mt-2 overflow-hidden">
              <ul className="py-1 max-h-60 overflow-auto" role="listbox" aria-label="Select country">
                {COUNTRIES.map((country) => (
                  <li key={country.code}>
                    <button
                      type="button"
                      className={cn(
                        'w-full flex items-center px-4 py-3 text-sm',
                        'hover:bg-orange-500/10 focus:bg-orange-500/10 focus:outline-none',
                        'transition-colors duration-150',
                        selectedCountry.code === country.code && 'bg-orange-500/20 text-orange-300'
                      )}
                      onClick={() => handleCountrySelect(country)}
                      role="option"
                      aria-selected={selectedCountry.code === country.code}
                    >
                      <span className="text-lg mr-3">{country.flag}</span>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-white">{country.name}</span>
                        <span className="ml-2 text-white/50">{country.dial}</span>
                      </div>
                      {selectedCountry.code === country.code && (
                        <Check className="h-4 w-4 text-orange-400" />
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
            'block w-full pl-28 pr-12 py-3.5 rounded-xl',
            'bg-white/5 border text-white placeholder-white/30',
            'focus:ring-2 focus:ring-offset-0 focus:outline-none',
            'transition-all duration-300',
            displayError
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              : phoneNumber.trim() && validationResult.isValid
                ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20',
            disabled && 'opacity-50 cursor-not-allowed',
            'text-base'
          )}
          aria-describedby={displayError ? 'phone-error' : undefined}
          aria-invalid={!!displayError}
        />

        {/* Status Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500/30 border-t-orange-500" />
          ) : phoneNumber.trim() && validationResult.isValid ? (
            <div className="p-1 bg-emerald-500/20 rounded-full">
              <Check className="h-4 w-4 text-emerald-400" />
            </div>
          ) : displayError ? (
            <div className="p-1 bg-red-500/20 rounded-full">
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
          ) : (
            <Phone className="h-5 w-5 text-white/30" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p id="phone-error" className="text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {displayError}
          </p>
        </div>
      )}

      {/* Success Message */}
      {phoneNumber.trim() && validationResult.isValid && validationResult.formatted && !displayError && (
        <p className="mt-3 text-sm text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          Valid number: {PhoneValidator.formatForDisplay(validationResult.formatted)}
        </p>
      )}

      {/* Help Text */}
      {!phoneNumber.trim() && !displayError && (
        <p className="mt-3 text-sm text-white/40">
          Enter your mobile number to receive verification code via SMS
        </p>
      )}
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
