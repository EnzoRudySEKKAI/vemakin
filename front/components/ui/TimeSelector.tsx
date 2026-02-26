import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface TimeSelectorProps {
  label?: string
  value: string
  onChange: (val: string) => void
}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

export const TimeSelector: React.FC<TimeSelectorProps> = ({ label, value = '00:00', onChange }) => {
  const safeValue = (value && value.includes(':')) ? value : '00:00'
  const [h, m] = safeValue.split(':')
  
  const [isOpen, setIsOpen] = useState(false)
  const [inputBuffer, setInputBuffer] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hoursListRef = useRef<HTMLDivElement>(null)
  const minutesListRef = useRef<HTMLDivElement>(null)
  const isTypingRef = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Scroll to selected values when opening
  useEffect(() => {
    if (isOpen) {
      const itemHeight = 36
      if (hoursListRef.current) {
        const hourIndex = hours.indexOf(h)
        hoursListRef.current.scrollTop = Math.max(0, hourIndex * itemHeight - itemHeight * 2)
      }
      if (minutesListRef.current) {
        const minuteIndex = minutes.indexOf(m)
        minutesListRef.current.scrollTop = Math.max(0, minuteIndex * itemHeight - itemHeight * 2)
      }
    }
  }, [isOpen, h, m])

  // Keyboard input handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    
    const key = e.key
    
    // Only handle number keys
    if (!/^\d$/.test(key)) return
    
    e.preventDefault()
    
    // Clear typing state after delay
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    isTypingRef.current = true
    const newBuffer = inputBuffer + key
    setInputBuffer(newBuffer)
    
    // Parse the input
    if (newBuffer.length >= 4) {
      // Full time entered: HHMM
      const hour = newBuffer.slice(0, 2)
      const minute = newBuffer.slice(2, 4)
      
      const hourNum = parseInt(hour, 10)
      const minuteNum = parseInt(minute, 10)
      
      if (hourNum >= 0 && hourNum <= 23 && minuteNum >= 0 && minuteNum <= 59) {
        // Round minute to nearest 5
        const roundedMinute = Math.round(minuteNum / 5) * 5
        const finalMinute = Math.min(roundedMinute, 55)
        const formattedTime = `${String(hourNum).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`
        onChange(formattedTime)
      }
      
      setInputBuffer('')
      isTypingRef.current = false
      setIsOpen(false)
    } else if (newBuffer.length === 3) {
      // Partial: could be H:MM or HH:M
      // Wait a bit to see if more digits coming
      typingTimeoutRef.current = setTimeout(() => {
        // Assume format H:MM
        const hour = newBuffer.slice(0, 1)
        const minute = newBuffer.slice(1, 3)
        
        const hourNum = parseInt(hour, 10)
        const minuteNum = parseInt(minute, 10)
        
        if (hourNum >= 0 && hourNum <= 9 && minuteNum >= 0 && minuteNum <= 59) {
          const roundedMinute = Math.round(minuteNum / 5) * 5
          const finalMinute = Math.min(roundedMinute, 55)
          const formattedTime = `${String(hourNum).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`
          onChange(formattedTime)
        }
        
        setInputBuffer('')
        isTypingRef.current = false
        setIsOpen(false)
      }, 500)
    } else if (newBuffer.length === 2) {
      // Could be just hours entered
      typingTimeoutRef.current = setTimeout(() => {
        const hourNum = parseInt(newBuffer, 10)
        if (hourNum >= 0 && hourNum <= 23) {
          const formattedTime = `${String(hourNum).padStart(2, '0')}:00`
          onChange(formattedTime)
        }
        setInputBuffer('')
        isTypingRef.current = false
        setIsOpen(false)
      }, 800)
    }
    
    // Reset typing state after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      setInputBuffer('')
      isTypingRef.current = false
    }, 1000)
  }, [isOpen, inputBuffer, onChange])

  // Add keyboard listener
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }, [isOpen, handleKeyDown])

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${m}`)
  }

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${h}:${newMinute}`)
  }

  return (
    <div ref={dropdownRef} className="w-full">
      {label && (
        <label className="block mb-2 text-xs font-mono tracking-wider text-muted-foreground">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            cursor-pointer w-full h-12 flex items-center justify-between px-3 pr-10 text-base font-mono text-foreground
            bg-[#f5f5f5] dark:bg-[#16181D] border border-gray-300 dark:border-white/10
            transition-all duration-150
            ${isOpen ? 'border-primary ring-1 ring-primary/20' : 'hover:border-gray-400 dark:hover:border-white/20'}
          `}
        >
          <span>{safeValue}</span>
          <ChevronDown 
            size={16} 
            strokeWidth={2}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 z-[70]"
            >
              <div className="bg-[#fafafa] dark:bg-[#16181D] border border-gray-300 dark:border-white/[0.08] shadow-lg overflow-hidden">
                <div className="flex">
                  {/* Hours Column */}
                  <div 
                    ref={hoursListRef}
                    className="flex-1 max-h-[216px] overflow-y-auto scrollbar-thin border-r border-gray-300 dark:border-white/[0.08]"
                  >
                    {hours.map((hour) => {
                      const isSelected = h === hour
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => handleHourChange(hour)}
                          className={`
                            cursor-pointer w-full flex items-center justify-center px-3 py-2 text-base font-mono transition-all duration-100
                            ${isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-foreground/30 hover:text-foreground hover:bg-[#f5f5f5] dark:hover:bg-white/5'
                            }
                          `}
                        >
                          {hour}
                        </button>
                      )
                    })}
                  </div>

                  {/* Minutes Column */}
                  <div 
                    ref={minutesListRef}
                    className="flex-1 max-h-[216px] overflow-y-auto scrollbar-thin"
                  >
                    {minutes.map((minute) => {
                      const isSelected = m === minute
                      return (
                        <button
                          key={minute}
                          type="button"
                          onClick={() => handleMinuteChange(minute)}
                          className={`
                            cursor-pointer w-full flex items-center justify-center px-3 py-2 text-base font-mono transition-all duration-100
                            ${isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-foreground/30 hover:text-foreground hover:bg-[#f5f5f5] dark:hover:bg-white/5'
                            }
                          `}
                        >
                          {minute}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TimeSelector
