import React, { useState } from 'react'
import { ArrowLeft, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { Button, Text, Input, IconContainer } from '@/components/atoms'
import { SimpleCard } from '@/components/ui/Card'
import { AuthLayout } from './AuthLayout'

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
    } catch (error: any) {
      console.error("Sign up failed", error)
      alert(`Sign up failed: ${error.message}`)
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
          <Text variant="h1" className="mb-3 text-white">Create Account</Text>
          <Text variant="body" color="muted">Join Vemakin to manage your productions.</Text>
        </div>

        <SimpleCard className="p-8 shadow-2xl shadow-black/50 border-white/5 bg-[#16181D]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                placeholder="Director Name"
                leftIcon={<User size={18} strokeWidth={2.5} className="text-gray-500" />}
                className="border-white/10"
              />

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

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                placeholder="Create a strong password"
                leftIcon={<Lock size={18} strokeWidth={2.5} className="text-gray-500" />}
                className="border-white/10"
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !name || !email || !password}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
              className="mt-6"
            >
              Create Account
            </Button>
          </form>
        </SimpleCard>
      </div>
    </AuthLayout>
  )
}
