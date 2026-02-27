import React, { useState, useEffect } from 'react'
import { Mail, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLayout } from './AuthLayout'

interface VerificationPendingViewProps {
  email: string
  onResendEmail: () => Promise<void>
  onGoToLogin: () => Promise<void>
  verified?: boolean
}

export const VerificationPendingView: React.FC<VerificationPendingViewProps> = ({
  email,
  onResendEmail,
  onGoToLogin,
  verified = false
}) => {
  const [countdown, setCountdown] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (countdown > 0 && !resendSuccess) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, resendSuccess])

  const handleResend = async () => {
    if (countdown > 0) return

    setIsResending(true)
    try {
      await onResendEmail()
      setResendSuccess(true)
      setCountdown(60)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to resend email:', error)
    } finally {
      setIsResending(false)
    }
  }

  if (verified) {
    return (
      <AuthLayout>
        <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-foreground">Email Verified</h1>
            <p className="text-muted-foreground">Your email has been verified successfully.</p>
          </div>
          <Button
            onClick={onGoToLogin}
            size="lg"
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
        <div className="mb-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Mail size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to
          </p>
          <p className="text-foreground font-mono mt-1">{email}</p>
        </div>

        <div className="border border-white/10 bg-[#0a0a0a]/80 p-6">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-3 text-[10px] font-mono text-white/40 uppercase tracking-wider">
              email_verification
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/70 font-mono">
                Click the link in the email to verify your account. Check your spam folder if you don't receive it within a few minutes.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 font-mono mb-3">
                Didn't receive the email?
              </p>
              <Button
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                variant="outline"
                className="w-full font-mono text-sm tracking-wider border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
              >
                {isResending ? (
                  <RefreshCw size={16} className="animate-spin mr-2" />
                ) : resendSuccess ? (
                  <>
                    <CheckCircle2 size={16} className="mr-2" />
                    Email Sent
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-2" />
                    Resend Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onGoToLogin}
            className="text-sm text-muted-foreground hover:text-foreground font-mono tracking-wider underline underline-offset-4"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
