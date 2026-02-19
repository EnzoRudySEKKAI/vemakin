import React, { useRef, useState, useEffect } from 'react'

interface ScrollFadeProps {
  children: React.ReactNode
  className?: string
  scrollKey?: any
}

export const ScrollFade: React.FC<ScrollFadeProps> = ({ children, className = '', scrollKey }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2) // 2px tolerance
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
      checkScroll()
    }
  }, [scrollKey])

  useEffect(() => {
    checkScroll()
    // Check after a short delay to ensure layout is computed
    const timer = setTimeout(checkScroll, 100)
    window.addEventListener('resize', checkScroll)
    return () => {
      window.removeEventListener('resize', checkScroll)
      clearTimeout(timer)
    }
  }, [children])

  return (
    <div className="relative min-w-0 w-full">
      {/* Left Fade */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F2F2F7] dark:from-[#141417] to-transparent pointer-events-none z-10 transition-opacity duration-75 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Right Fade */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F2F2F7] dark:from-[#141417] to-transparent pointer-events-none z-10 transition-opacity duration-75 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`${className} overflow-x-auto no-scrollbar scroll-smooth`}
      >
        {children}
      </div>
    </div>
  )
}
