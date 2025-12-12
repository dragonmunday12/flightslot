'use client'

import React, { useState } from 'react'

type CountryCode = {
  code: string
  label: string
  flag: string
}

const COUNTRY_CODES: CountryCode[] = [
  { code: '+1', label: 'US/Canada', flag: '🇺🇸' },
  { code: '+44', label: 'UK', flag: '🇬🇧' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: '+86', label: 'China', flag: '🇨🇳' },
  { code: '+91', label: 'India', flag: '🇮🇳' },
  { code: '+81', label: 'Japan', flag: '🇯🇵' },
  { code: '+49', label: 'Germany', flag: '🇩🇪' },
  { code: '+33', label: 'France', flag: '🇫🇷' },
  { code: '+39', label: 'Italy', flag: '🇮🇹' },
  { code: '+34', label: 'Spain', flag: '🇪🇸' },
  { code: '+52', label: 'Mexico', flag: '🇲🇽' },
  { code: '+55', label: 'Brazil', flag: '🇧🇷' },
]

type PhoneInputProps = {
  label?: string
  value: string // Full phone number with country code (e.g., "+15551234567")
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  error?: string
}

export function PhoneInput({
  label,
  value,
  onChange,
  placeholder = '5551234567',
  disabled = false,
  required = false,
  className = '',
  error,
}: PhoneInputProps) {
  // Parse the current value to extract country code and number
  const parsePhoneNumber = (phone: string): { countryCode: string; number: string } => {
    if (!phone) return { countryCode: '+1', number: '' }

    // Find matching country code
    const matchedCountry = COUNTRY_CODES.find(c => phone.startsWith(c.code))
    if (matchedCountry) {
      return {
        countryCode: matchedCountry.code,
        number: phone.slice(matchedCountry.code.length),
      }
    }

    // Default to +1
    return { countryCode: '+1', number: phone.replace(/^\+/, '') }
  }

  const { countryCode: initialCountryCode, number: initialNumber } = parsePhoneNumber(value)
  const [countryCode, setCountryCode] = useState(initialCountryCode)
  const [phoneNumber, setPhoneNumber] = useState(initialNumber)

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode)
    // Update the full phone number
    onChange(phoneNumber ? `${newCode}${phoneNumber}` : '')
  }

  const handlePhoneNumberChange = (newNumber: string) => {
    // Remove any non-digit characters
    const cleaned = newNumber.replace(/\D/g, '')
    setPhoneNumber(cleaned)
    // Update the full phone number
    onChange(cleaned ? `${countryCode}${cleaned}` : '')
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db' }}>
          {label}
          {required && <span style={{ color: '#f87171', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Country Code Dropdown */}
        <select
          value={countryCode}
          onChange={(e) => handleCountryCodeChange(e.target.value)}
          disabled={disabled}
          style={{
            width: '140px',
            padding: '0.5rem',
            border: error ? '1px solid #f87171' : '1px solid #4b5563',
            borderRadius: '0.5rem',
            backgroundColor: disabled ? '#1f2937' : '#374151',
            color: '#ffffff',
            transition: 'all 0.2s',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#f87171' : '#4b5563'
            e.target.style.boxShadow = 'none'
          }}
        >
          {COUNTRY_CODES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code}
            </option>
          ))}
        </select>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            flex: 1,
            padding: '0.5rem 1rem',
            border: error ? '1px solid #f87171' : '1px solid #4b5563',
            borderRadius: '0.5rem',
            backgroundColor: disabled ? '#1f2937' : '#374151',
            color: '#ffffff',
            transition: 'all 0.2s',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#f87171' : '#4b5563'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>
      {error && <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{error}</span>}
    </div>
  )
}
