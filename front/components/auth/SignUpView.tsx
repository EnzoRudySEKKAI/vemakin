import React, { useState } from 'react'
import { ArrowLeft, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { Card, Button, Text, Input, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

interface SignUpViewProps {
  onBack: () => void
  onSignUp: (name: string, email: string) => void
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onBack, onSignUp }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return

    setIsLoading(true)
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
      const { auth } = await import('@/firebase')
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        })
      }
      // Store updates automatically via listener
    } catch (error: any) {
      console.error("Sign up failed", error)
      alert(`Sign up failed: ${error.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F2F2F7] dark:bg-[#0A0A0A]">
      {/* Abstract Background - Matching SignInView */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-8 duration-700 fade-in">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          size="md"
          className="group absolute top-[-80px] left-0 p-3 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm"
        >
          <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
        </Button>

        <div className="mb-10 text-center">
          <Text variant="h1" className="mb-3">Create Account</Text>
          <Text variant="body" color="muted">Join Vemakin to manage your productions.</Text>
        </div>

        <Card variant="glass" className="p-8 shadow-2xl shadow-blue-500/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Text variant="label" color="muted" className="ml-1 block">Full Name</Text>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3762E3] dark:group-focus-within:text-[#4E47DD] transition-colors" size={18} strokeWidth={2.5} />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  placeholder="Director Name"
                  className="pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Text variant="label" color="muted" className="ml-1 block">Email Address</Text>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3762E3] dark:group-focus-within:text-[#4E47DD] transition-colors" size={18} strokeWidth={2.5} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  placeholder="name@studio.com"
                  className="pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Text variant="label" color="muted" className="ml-1 block">Password</Text>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3762E3] dark:group-focus-within:text-[#4E47DD] transition-colors" size={18} strokeWidth={2.5} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  placeholder="Create a strong password"
                  className="pl-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !name || !email || !password}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} strokeWidth={2.5} />}
              className="mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
