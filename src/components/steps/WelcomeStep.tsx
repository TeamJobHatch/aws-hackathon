'use client'

import { ArrowRight, Sparkles, Target, Zap, BarChart3, Users, Award, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface WelcomeStepProps {
  goToNextStep: () => void
}

// Optimized Counter Component
const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [current, setCurrent] = useState(0)
  
  useEffect(() => {
    // Simplified animation without heavy intervals
    const timer = setTimeout(() => {
      setCurrent(target)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [target])
  
  return (
    <span className="gradient-text">
      {Math.floor(current)}{suffix}
    </span>
  )
}

// Floating Orb Component
const FloatingOrb = ({ delay = 0, size = 100, color = 'blue' }: { delay?: number; size?: number; color?: string }) => (
  <motion.div
    className={`absolute opacity-30 rounded-full ${
      color === 'blue' ? 'bg-blue-400' : 
      color === 'orange' ? 'bg-orange-400' : 
      'bg-purple-400'
    }`}
    style={{ width: size, height: size }}
    animate={{
      y: [0, -30, 0],
      x: [0, 20, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
)

export default function WelcomeStep({ goToNextStep }: WelcomeStepProps) {
  const features = [
    {
      icon: Target,
      title: "Smart Matching",
      description: "AI analyzes technical skills, experience, and cultural fit"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Watch as our AI researches each candidate across the web"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Reports",
      description: "Get detailed insights and rankings for informed decisions"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fff7e8' }}>
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        {/* Hero Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mr-4 p-2">
              <img 
                src="/images/LOGO.jpg" 
                alt="JobHatch Logo" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-orange-600">JobHatch</h1>
          </div>
          <p className="text-lg text-gray-600 font-medium mb-8">Enterprise AI</p>
          
          {/* Main Heading */}
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-8">
            Find Your <span className="text-orange-600">Perfect Candidate</span> in Minutes
          </h2>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            🚀 AI-powered resume screening that analyzes candidates across{' '}
            <span className="font-semibold text-blue-600">LinkedIn</span>, GitHub, and{' '}
            <span className="font-semibold text-orange-600">personal portfolios</span>{' '}
            to find the perfect match for your role.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-lg transition-transform duration-200 hover:transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <button
            onClick={goToNextStep}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full text-xl font-semibold inline-flex items-center transition-all duration-200 transform hover:scale-105"
          >
            🚀 Get Started Now
            <ArrowRight className="ml-3 h-6 w-6" />
          </button>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          {[
            { icon: Users, value: 500, suffix: '+', label: 'Companies Trust Us' },
            { icon: Award, value: 95, suffix: '%', label: 'Accuracy Rate' },
            { icon: Clock, value: 5, suffix: ' Min', label: 'Average Analysis' },
            { icon: BarChart3, value: 10, suffix: 'K+', label: 'Resumes Analyzed' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.1, type: "spring", stiffness: 200 }}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold mb-2 text-gray-800">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
} 