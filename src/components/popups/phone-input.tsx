'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CountryCode {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = 'Phone number',
  required = true,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [localNumber, setLocalNumber] = useState('');

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, spaces, and hyphens
    const cleaned = e.target.value.replace(/[^\d\s-]/g, '');
    setLocalNumber(cleaned);
    // Combine country code with number
    onChange(`${selectedCountry.dial}${cleaned.replace(/[\s-]/g, '')}`);
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    // Update the full phone number with new country code
    onChange(`${country.dial}${localNumber.replace(/[\s-]/g, '')}`);
  };

  return (
    <div className="relative">
      <div className="flex rounded-full overflow-hidden bg-[var(--cream)] focus-within:ring-2 focus-within:ring-[var(--primary)]">
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-4 py-4 border-r border-[var(--border)] hover:bg-[var(--cream)]/80 transition-colors"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm text-[var(--muted-foreground)]">{selectedCountry.dial}</span>
          <ChevronDown className="w-3 h-3 text-[var(--muted-foreground)]" />
        </button>

        {/* Phone input */}
        <input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={placeholder}
          required={required}
          className="flex-1 px-4 py-4 text-base bg-transparent border-0 focus:outline-none placeholder:text-[var(--muted-foreground)]"
        />
      </div>

      {/* Country dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-20 w-64 max-h-60 overflow-y-auto bg-white rounded-xl shadow-lg border border-[var(--border)]">
            {COUNTRY_CODES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--cream)] transition-colors text-left"
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1 text-sm">{country.name}</span>
                <span className="text-sm text-[var(--muted-foreground)]">{country.dial}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
