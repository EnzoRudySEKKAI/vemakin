import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/Card'
import { AuthLayout } from './AuthLayout'
import { useAuthStore } from '@/stores/useAuthStore'
import { getFirebaseAuth } from '@/firebase'

const RESEND_COOLDOWN_SECONDS = 60

export const EmailVerificationView: React.FC = () => {
  const navigate = useNavigate()
  const { logout, currentUser } = useAuthStore()
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [isVerifying, setIsVerifying] = useState(true)
  const [firebaseEmailVerified, setFirebaseEmailVerified] = useState(false)

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { getAuth, reload } = await import('firebase/auth')
        const auth = getFirebaseAuth()
        
        if (auth.currentUser) {
          await reload(auth.currentUser)
          setFirebaseEmailVerified(auth.currentUser.emailVerified)
          
          if (auth.currentUser.emailVerified) {
            navigate('/dashboard')
          }
        }
      } catch (error) {
        console.error('Failed to check verification status:', error)
      } finally {
        setIsVerifying(false)
      }
    }

    checkVerification()
  }, [navigate])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  useEffect(() => {
    if (isVerifying) return

    const interval = setInterval(async () => {
      try {
        const { getAuth, reload } = await import('firebase/auth')
        const auth = getFirebaseAuth()
        
        if (auth.currentUser) {
          await reload(auth.currentUser)
          setFirebaseEmailVerified(auth.currentUser.emailVerified)
          
          if (auth.currentUser.emailVerified) {
            navigate('/dashboard')
          }
        }
      } catch (error) {
        console.error('Failed to check verification status:', error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isVerifying, navigate])

  const handleResendEmail = async () => {
    if (cooldown > 0) return

    setIsResending(true)
    try {
      const { sendEmailVerification } = await import('firebase/auth')
      const auth = getFirebaseAuth()
      const { currentUser } = auth

      if (currentUser) {
        await sendEmailVerification(currentUser)
        setCooldown(RESEND_COOLDOWN_SECONDS)
      }
    } catch (error) {
      console.error('Failed to resend email:', error)
      alert('Failed to resend email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (isVerifying) {
    return (
      <AuthLayout>
        <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <Card className="p-8 shadow-2xl shadow-black/50 border-border bg-card">
            <CardContent className="p-0 flex flex-col items-center justify-center py-8">
              <RefreshCw className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Checking verification status...</p>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Mail size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to your email address. 
            Please check your inbox and click the link to verify your account.
          </p>
        </div>

        <Card className="p-8 shadow-2xl shadow-black/50 border-border bg-card">
          <CardContent className="p-0 space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Once verified, you'll be automatically redirected to the dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleResendEmail}
                disabled={cooldown > 0 || isResending}
                className="w-full h-12"
                variant="default"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                onClick={handleLogout}
                className="w-full h-12"
                variant="outline"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
