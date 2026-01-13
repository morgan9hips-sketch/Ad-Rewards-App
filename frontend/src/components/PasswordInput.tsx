import { useState, InputHTMLAttributes } from 'react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export default function PasswordInput({ label, className = '', ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 pr-10 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
    </div>
  )
}
