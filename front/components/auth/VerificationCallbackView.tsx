import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLayout } from './AuthLayout'

export const VerificationCallbackView: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const mode = searchParams.get('mode')
      const oobCode = searchParams.get('oobCode')

      if (mode !== 'verifyEmail' || !oobCode) {
        setStatus('error')
        setErrorMessage('Invalid verification link')
        return
      }

      try {
        const { applyActionCode } = await import('firebase/auth')
        const { getFirebaseAuth } = await import('@/firebase')
        
        await applyActionCode(getFirebaseAuth(), oobCode)
        setStatus('success')
        
        setTimeout(() => {
          navigate('/auth/login?verified=true')
        }, 2000)
      } catch (error: any) {
        console.error('Verification failed:', error)
        setStatus('error')
        
        if (error.code === 'auth/expired-action-code') {
          setErrorMessage('Verification link has expired')
        } else if (error.code === 'auth/invalid-action-code') {
          setErrorMessage('Invalid verification link')
        } else if (error.code === 'auth/email-already-verified') {
          setErrorMessage('Email already verified')
          setTimeout(() => {
            navigate('/auth/login?verified=true')
          }, 2000)
        } else {
          setErrorMessage('Verification failed. Please try again.')
        }
      }
    }

    verifyEmail()
  }, [searchParams, navigate])

  return (
    <AuthLayout>
      <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
        <div className="mb-10 text-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 size={40} className="text-primary animate-spin" />
              </div>
              <h1 className="text-3xl font-bold mb-3 text-foreground">Verifying Email</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-3 text-foreground">Email Verified!</h1>
              <p className="text-muted-foreground">
                Redirecting you to login...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle size={40} className="text-red-500" />
              </div>
              <h1 className="text-3xl font-bold mb-3 text-foreground">Verification Failed</h1>
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
            </>
          )}
        </div>

        {status === 'error' && (
          <Button
            onClick={() => navigate('/auth/login')}
            size="lg"
            className="w-full"
          >
            Back to Login
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}
