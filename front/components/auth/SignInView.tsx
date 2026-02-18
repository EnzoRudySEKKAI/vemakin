import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button, Text, Input } from '@/components/atoms'
import { SimpleCard } from '@/components/ui/Card'
import { AuthLayout } from './AuthLayout'

interface SignInViewProps {
  onBack: () => void
  onSignIn: (name: string, email: string) => void
}

export const SignInView: React.FC<SignInViewProps> = ({ onBack, onSignIn }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const { auth } = await import('@/firebase')
      await signInWithEmailAndPassword(auth, email, password)
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
          size="md"
          className="group absolute top-[-80px] left-0 p-3 bg-[#16181D] border border-white/5 shadow-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
        </Button>

        <div className="mb-10 text-center">
          <Text variant="h1" className="mb-3 text-white">Welcome Back</Text>
          <Text variant="body" color="muted">Enter your credentials to access your productions.</Text>
        </div>

        <SimpleCard className="p-8 shadow-2xl shadow-black/50 border-white/5 bg-[#16181D]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                placeholder="name@studio.com"
                leftIcon={<Mail size={18} strokeWidth={2.5} className="text-gray-500" />}
                className="border-white/10"
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center pr-1">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Password</span>
                  <Link 
                    to="/auth/forgot-password" 
                    className="ml-auto text-primary hover:underline text-xs font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  placeholder="••••••••"
                  leftIcon={<Lock size={18} strokeWidth={2.5} className="text-gray-500" />}
                  className="border-white/10"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !email || !password}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
              className="mt-6"
            >
              Sign In
            </Button>
          </form>
        </SimpleCard>
      </div>
    </AuthLayout>
  )
}
