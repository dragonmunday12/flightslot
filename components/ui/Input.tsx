'use client'

import React from 'react'

type InputProps = {
  label?: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  maxLength?: number
  className?: string
  error?: string
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  maxLength,
  className = '',
  error,
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db' }}>
          {label}
          {required && <span style={{ color: '#f87171', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        style={{
          padding: '0.5rem 1rem',
          border: error ? '1px solid #f87171' : '1px solid #4b5563',
          borderRadius: '0.5rem',
          backgroundColor: disabled ? '#1f2937' : '#374151',
          color: '#ffffff',
          transition: 'all 0.2s',
          outline: 'none'
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
      {error && <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{error}</span>}
    </div>
  )
}
