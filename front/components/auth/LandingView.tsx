import React from 'react'
import { ArrowRight, User, Aperture } from 'lucide-react'
import { Card, Button, Text, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

// Icons as components
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.21H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" className="dark:fill-white" fill="#000000" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.68-.3-1.3-.4-2.03-.4-.73 0-1.35.1-2.03.4-1.03.48-2.1.55-3.08-.4-1.98-1.95-2.95-5.38-1.45-8.1 1.08-1.95 3-2.9 4.95-2.9 1.25 0 2.25.4 2.95.68.7.28 1.15.28 1.85.03.88-.35 2.05-.7 3.3-.68 1.55.02 2.98.78 3.8 1.95-3.18 1.58-2.65 6.08.53 7.33-.25.7-.6 1.48-1.15 2.05-.75.75-1.6 1.38-2.58 1.65zm-1.85-11.8c-.28-1.58.9-3.23 2.45-3.95.23 1.7-1.18 3.4-2.45 3.95z" />
  </svg>
)

interface LandingViewProps {
  onSignIn: () => void
  onSignUp: () => void
  onGuest: () => void
}

export const LandingView: React.FC<LandingViewProps> = ({ onSignIn, onSignUp, onGuest }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F2F2F7] dark:bg-[#0A0A0A]">
      {/* Abstract Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-10 relative z-10">
        {/* Logo Section */}
        <div className="text-center space-y-6 animate-in slide-in-from-top-8 duration-700">
          <IconContainer
            icon={Aperture}
            size="xl"
            variant="accent"
            className="mx-auto text-[#3762E3] dark:text-[#4E47DD] bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl shadow-2xl shadow-blue-100 dark:shadow-blue-900/10 ring-1 ring-black/5 dark:ring-white/10"
          />
          <div>
            <Text variant="hero" className="mb-2">Vemakin</Text>
            <Text variant="body" color="muted">Production OS</Text>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700 delay-150">
          <Card variant="glass" className="p-1.5">
            <Button
              onClick={onSignIn}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight size={18} strokeWidth={2.5} />}
            >
              Sign In
            </Button>
          </Card>

          <Button
            onClick={onSignUp}
            variant="secondary"
            size="lg"
            fullWidth
          >
            Create Account
          </Button>

          {/* Social Logins */}
          <div className="pt-3">
            <div className="flex items-center gap-6 mb-4">
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1 opacity-50" />
              <Text variant="label" color="muted">Or Continue With</Text>
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1 opacity-50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onSignIn}
                variant="secondary"
                size="md"
                leftIcon={<GoogleIcon />}
              >
                Google
              </Button>
              <Button
                onClick={onSignIn}
                variant="secondary"
                size="md"
                leftIcon={<AppleIcon />}
              >
                Apple
              </Button>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <Button
              onClick={onGuest}
              variant="ghost"
              size="sm"
              leftIcon={<User size={14} strokeWidth={2.5} />}
            >
              Continue Without Account
            </Button>
          </div>
        </div>

        {/* Footer */}
        <Text variant="label" color="muted" className="text-center max-w-xs mx-auto leading-relaxed opacity-60">
          By entering, you agree to our Terms of Service and Privacy Policy.
          <br />Designed for modern filmmakers.
        </Text>
      </div>
    </div>
  )
}
