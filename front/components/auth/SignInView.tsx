import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
} from '@/components/ui/Card'
import { AuthLayout } from './AuthLayout'
import { useAuthStore } from '@/stores/useAuthStore'

interface SignInViewProps {
  onBack: () => void
  onSignIn: (name: string, email: string) => void
}

export const SignInView: React.FC<SignInViewProps> = ({ onBack, onSignIn }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { authPromise } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false)

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowVerifiedMessage(true)
      setTimeout(() => setShowVerifiedMessage(false), 5000)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      const { signInWithEmailAndPassword, reload } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('@/firebase')
      const auth = getFirebaseAuth()
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Reload user to get latest emailVerified status from Firebase
      await reload(userCredential.user)
      
      // Wait for auth to be resolved and profile to be fetched
      if (authPromise) {
        await authPromise
      }
      
      // Small delay to ensure store is updated
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if email is verified - check both Firebase user object and local store
      const firebaseUser = auth.currentUser
      const { currentUser } = useAuthStore.getState()
      
      const isEmailVerified = firebaseUser?.emailVerified ?? currentUser?.emailVerified ?? false
      
      if (!isEmailVerified) {
        navigate('/auth/verify-email')
      } else {
        onSignIn('', email)
      }
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

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3 text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your productions.</p>
        </div>

        {showVerifiedMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-400">Your email has been verified! You can now sign in.</p>
          </div>
        )}

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
