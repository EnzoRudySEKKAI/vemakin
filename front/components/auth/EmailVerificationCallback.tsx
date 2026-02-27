import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/Card'
import { AuthLayout } from './AuthLayout'

export const EmailVerificationCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const mode = searchParams.get('mode')
      const oobCode = searchParams.get('oobCode')

      if (mode !== 'verifyEmail' || !oobCode) {
        setStatus('error')
        setErrorMessage('Invalid verification link. Missing parameters.')
        return
      }

      try {
        const { applyActionCode, fetchSignInMethodsForEmail } = await import('firebase/auth')
        const { getFirebaseAuth } = await import('@/firebase')
        const auth = getFirebaseAuth()
        
        await applyActionCode(auth, oobCode)
        
        setStatus('success')
        
        setTimeout(() => {
          navigate('/auth/login?verified=true')
        }, 2000)
      } catch (error: any) {
        console.error('Email verification failed:', error)
        setStatus('error')
        if (error.code === 'auth/expired-action-code') {
          setErrorMessage('The verification link has expired. Please request a new one.')
        } else if (error.code === 'auth/invalid-action-code') {
          setErrorMessage('The verification link is invalid. Please request a new one.')
        } else {
          setErrorMessage('An error occurred during verification. Please try again.')
        }
      }
    }

    verifyEmail()
  }, [searchParams, navigate])

  if (status === 'loading') {
    return (
      <AuthLayout>
        <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <Card className="p-8 shadow-2xl shadow-black/50 border-border bg-card">
            <CardContent className="p-0 flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'error') {
    return (
      <AuthLayout>
        <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-foreground">Verification Failed</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>

          <Card className="p-8 shadow-2xl shadow-black/50 border-border bg-card">
            <CardContent className="p-0">
              <Button
                onClick={() => navigate('/auth/verify-email')}
                className="w-full h-12"
              >
                <Mail className="w-4 h-4 mr-2" />
                Request New Verification Email
              </Button>
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">Email Verified!</h1>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>

        <Card className="p-8 shadow-2xl shadow-black/50 border-border bg-card">
          <CardContent className="p-0 flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
