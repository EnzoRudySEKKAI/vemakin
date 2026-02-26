import React, { useState } from 'react'
import { ArrowLeft, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
} from '@/components/ui/Card'
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
      const { getFirebaseAuth } = await import('@/firebase')
      const userCredential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)

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
          size="icon"
          className="group absolute top-[-80px] left-0 bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
        </Button>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3 text-foreground">Create Account</h1>
          <p className="text-muted-foreground">Join Vemakin to manage your productions.</p>
        </div>

        <Card className="p-8 shadow-2xl shadow-black/50 border-border bg-card">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Director Name"
                      className="pl-10 border-border"
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock size={18} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="pl-10 border-border"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !name || !email || !password}
                size="lg"
                className="w-full mt-6"
              >
                {isLoading ? (
                  'Creating account...'
                ) : (
                  <>
                    Create Account
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
