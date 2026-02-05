'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/context/auth-context'
import Image from 'next/image'

export default function PasswordScreen() {
  const { authenticate } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (authenticate(password)) {
      setPassword('')
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }

    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-2xl ring-1 ring-white/60 p-8 max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Image
            loading="eager"
            src="/GIRL3.jpg"
            alt="G.I.R.L. Logo"
            width={300}
            height={120}
            className="h-20 w-auto"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Welcome
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the password to access the Derby Viewer
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-900 placeholder-gray-500 transition-colors"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
