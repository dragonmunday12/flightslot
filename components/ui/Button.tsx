'use client'

import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white',
  danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white',
  success: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white',
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors duration-200
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
