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
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
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
        className={`
          px-4 py-2 border rounded-lg transition-colors duration-200
          ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-white dark:bg-gray-700 dark:text-white'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
        `}
      />
      {error && <span className="text-sm text-red-500 dark:text-red-400">{error}</span>}
    </div>
  )
}
