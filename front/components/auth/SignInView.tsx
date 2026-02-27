import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
} from '@/components/ui/Card'
import { AuthLayout } from './AuthLayout'
import api from '@/api/client'

interface SignInViewProps {
  onBack: () => void
  onSignIn: (name: string, email: string) => void
  onVerificationRequired: (email: string) => void
}

export const SignInView: React.FC<SignInViewProps> = ({ onBack, onSignIn, onVerificationRequired }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const verified = searchParams.get('verified')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      const { signInWithEmailAndPassword, reloadUser } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('@/firebase')
      const userCredential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
      const user = userCredential.user

      await reloadUser(user)

      if (!user.emailVerified) {
        await getFirebaseAuth().signOut()
        onVerificationRequired(email)
        return
      }

      try {
        await api.post('/users/sync-email-verified', { emailVerified: true })
      } catch (err) {
        console.error('Failed to sync email verified status:', err)
      }

      const name = user.displayName || email.split('@')[0]
      onSignIn(name, email)
    } catch (error: any) {
      console.error("Sign in failed", error)
      alert("Login failed. Please check your credentials.")
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="group absolute top-[-80px] left-0 bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
        </Button>

        {verified && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm text-center font-mono">
              Email verified successfully! You can now sign in.
            </p>
          </div>
        )}

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3 text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your productions.</p>
        </div>

        <Card className="p-8 shadow-2xl shadow-black/50 border-border bg-card">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@studio.com"
                      className="pl-10 border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Password
                    </Label>
                    <Link 
                      to="/auth/forgot-password" 
                      className="text-primary hover:underline text-xs font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 border-border"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                size="lg"
                className="w-full mt-6"
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} strokeWidth={2.5} className="ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
