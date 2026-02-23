"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useState, useEffect, useRef } from "react"

interface JourneyStarProps {
  startPosition: { x: number; y: number }
  featureCardRefs?: React.RefObject<HTMLDivElement>[]
}

export function JourneyStar({ startPosition, featureCardRefs = [] }: JourneyStarProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [featuresPos, setFeaturesPos] = useState({ x: 0, y: 0 })
  const [cardPositions, setCardPositions] = useState<Array<{ x: number; y: number; width: number; height: number }>>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
      
      const updatePositions = () => {
        const featuresEl = document.getElementById("features")
        if (featuresEl) {
          const rect = featuresEl.getBoundingClientRect()
          const scrollY = window.scrollY || window.pageYOffset
          setFeaturesPos({
            x: rect.left + rect.width * 0.1,
            y: rect.top + scrollY + 50,
          })

          // Get positions of feature cards
          const cards = document.querySelectorAll('[data-feature-card]')
          const positions = Array.from(cards).map((card) => {
            const cardRect = card.getBoundingClientRect()
            const cardScrollY = window.scrollY || window.pageYOffset
            return {
              x: cardRect.left + cardRect.width / 2,
              y: cardRect.top + cardScrollY + cardRect.height / 2,
              width: cardRect.width,
              height: cardRect.height,
            }
          })
          setCardPositions(positions)
        } else {
          setFeaturesPos({
            x: window.innerWidth * 0.1,
            y: window.innerHeight * 1.2,
          })
        }
      }
      
      updatePositions()
      
      const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight })
        updatePositions()
      }
      
      const handleScroll = () => {
        updatePositions()
      }
      
      window.addEventListener("resize", handleResize)
      window.addEventListener("scroll", handleScroll)
      return () => {
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Track entire page scroll
  const { scrollYProgress } = useScroll()

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 30,
    restDelta: 0.001,
  })

  // Smooth S-curve path through features cards
  const getCardPathPosition = (progress: number) => {
    if (cardPositions.length === 0) return null
    
    // Features section spans 0.1 to 0.3 of scroll progress
    const featuresStart = 0.1
    const featuresEnd = 0.3
    
    if (progress >= featuresStart && progress <= featuresEnd) {
      const featuresProgress = (progress - featuresStart) / (featuresEnd - featuresStart)
      
      // Smoothly move through each card
      if (cardPositions.length >= 3) {
        if (featuresProgress < 0.33) {
          // First card - approach from left, curve through center
          const cardProgress = featuresProgress / 0.33
          const card = cardPositions[0]
          if (card) {
            return {
              x: card.x - card.width * 0.4 * (1 - cardProgress),
              y: card.y - card.height * 0.1 * (1 - cardProgress),
            }
          }
        } else if (featuresProgress < 0.66) {
          // Second card - smooth transition
          const cardProgress = (featuresProgress - 0.33) / 0.33
          const card = cardPositions[1]
          if (card) {
            return {
              x: card.x - card.width * 0.2 * Math.sin(cardProgress * Math.PI),
              y: card.y - card.height * 0.1 * (1 - cardProgress),
            }
          }
        } else {
          // Third card - smooth transition
          const cardProgress = (featuresProgress - 0.66) / 0.34
          const card = cardPositions[2]
          if (card) {
            return {
              x: card.x + card.width * 0.2 * (1 - cardProgress),
              y: card.y - card.height * 0.1 * (1 - cardProgress),
            }
          }
        }
      }
    }
    return null
  }

  // X position - smooth S-curve through features
  const x = useTransform(smoothProgress, (progress) => {
    const cardPos = getCardPathPosition(progress)
    if (cardPos && cardPos.x) return cardPos.x
    
    // Default path - ensure we always have a value
    if (progress < 0.05) {
      return startPosition.x
    } else if (progress < 0.1) {
      // Smooth transition to features
      const t = (progress - 0.05) / 0.05
      return startPosition.x - dimensions.width * 0.2 * t
    } else if (progress < 0.3) {
      // In features section - use card positions or fallback
      if (cardPositions.length > 0 && cardPositions[0]) {
        const featuresProgress = (progress - 0.1) / 0.2
        if (featuresProgress < 0.33) {
          return cardPositions[0].x - cardPositions[0].width * 0.2
        } else if (featuresProgress < 0.66 && cardPositions[1]) {
          return cardPositions[1].x
        } else if (cardPositions[2]) {
          return cardPositions[2].x + cardPositions[2].width * 0.1
        }
      }
      return featuresPos.x || dimensions.width * 0.1
    } else if (progress < 0.5) {
      return (featuresPos.x || dimensions.width * 0.1) + dimensions.width * 0.15
    } else if (progress < 0.7) {
      return (featuresPos.x || dimensions.width * 0.1) - dimensions.width * 0.05
    } else if (progress < 0.85) {
      return dimensions.width * 0.45
    } else {
      return dimensions.width * 0.5
    }
  })

  // Y position - smooth downward movement
  const y = useTransform(smoothProgress, (progress) => {
    const cardPos = getCardPathPosition(progress)
    if (cardPos && cardPos.y) return cardPos.y
    
    // Default path - ensure we always have a value
    if (progress < 0.05) {
      return startPosition.y
    } else if (progress < 0.1) {
      const t = (progress - 0.05) / 0.05
      return startPosition.y + dimensions.height * 0.15 * t
    } else if (progress < 0.3) {
      // In features section - use card positions or fallback
      if (cardPositions.length > 0 && cardPositions[0]) {
        const featuresProgress = (progress - 0.1) / 0.2
        if (featuresProgress < 0.33) {
          return cardPositions[0].y
        } else if (featuresProgress < 0.66 && cardPositions[1]) {
          return cardPositions[1].y
        } else if (cardPositions[2]) {
          return cardPositions[2].y
        }
      }
      return featuresPos.y || dimensions.height * 1.2
    } else if (progress < 0.5) {
      return startPosition.y + dimensions.height * 1.2
    } else if (progress < 0.7) {
      return startPosition.y + dimensions.height * 2.0
    } else {
      return dimensions.height - 150
    }
  })

  // Scale - starts small to match fullstop size, then grows as it moves through sections
  const scale = useTransform(
    smoothProgress,
    [0, 0.1, 0.3, 0.5, 0.7, 1],
    [0.15, 0.3, 0.6, 0.9, 1.3, 1.8]
  )

  // Brightness - gets brighter
  const brightness = useTransform(
    smoothProgress,
    [0, 0.6, 1],
    [0.5, 0.8, 2.0]
  )

  // Glow size - grows significantly at bottom
  const glowSize = useTransform(
    smoothProgress,
    [0, 0.6, 1],
    [60, 200, 600]
  )

  // Glow intensity - very bright at bottom
  const glowIntensity = useTransform(
    smoothProgress,
    [0, 0.6, 1],
    [0.2, 0.5, 1.2]
  )

  // Rotation for star twinkle
  const rotate = useTransform(smoothProgress, [0, 1], [0, 360])

  return (
    <motion.div
      className="fixed pointer-events-none z-30"
      style={{
        left: x,
        top: y,
        x: "-50%",
        y: "-50%",
        scale,
        filter: `brightness(${brightness})`,
        rotate,
        transformOrigin: "center center",
      }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-500 blur-3xl"
        style={{
          width: glowSize,
          height: glowSize,
          opacity: glowIntensity,
          x: "-50%",
          y: "-50%",
          left: "50%",
          top: "50%",
        }}
      />

      {/* Star shape */}
      <motion.div
        className="relative w-20 h-20"
        animate={{
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Star SVG */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="absolute inset-0"
          fill="none"
        >
          <motion.path
            d="M40 0 L48 28 L76 28 L54 44 L64 72 L40 56 L16 72 L26 44 L4 28 L32 28 Z"
            fill="url(#starGradient)"
            style={{
              filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))",
            }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </motion.div>
  )
}
