import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, ArrowRight } from 'lucide-react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase'
import { Button, Text, Input } from '@/components/atoms'
import { SimpleCard } from '@/components/ui/Card'
import { AuthLayout } from './AuthLayout'

export function ForgotPasswordView() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      await sendPasswordResetEmail(auth, email)
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Password reset failed', err)
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
        <Button
          onClick={() => navigate('/auth/login')}
          variant="ghost"
          size="md"
          className="group absolute top-[-80px] left-0 p-3 bg-[#16181D] border border-white/5 shadow-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
        </Button>

        <div className="mb-10 text-center">
          <Text variant="h1" className="mb-3 text-white">Reset Password</Text>
          <Text variant="body" color="muted">
            {isSuccess 
              ? 'Check your email for reset instructions.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </Text>
        </div>

        <SimpleCard className="p-8 shadow-2xl shadow-black/50 border-white/5 bg-[#16181D]">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Mail size={32} className="text-primary" />
              </div>
              <Text variant="body" color="muted">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>
              </Text>
              <Button
                onClick={() => navigate('/auth/login')}
                variant="primary"
                size="lg"
                fullWidth
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                placeholder="name@studio.com"
                leftIcon={<Mail size={18} strokeWidth={2.5} className="text-gray-500" />}
                className="border-white/10"
                error={error}
              />

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading || !email}
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </SimpleCard>
      </div>
    </AuthLayout>
  )
}
