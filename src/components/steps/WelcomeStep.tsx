'use client'

import { ArrowRight, Briefcase, Sparkles, Target, Zap, BarChart3, Users, Award, Clock } from 'lucide-react'
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0 }
  }

  const features = [
    {
      icon: Target,
      title: "Smart Matching",
      description: "AI analyzes technical skills, experience, and cultural fit",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Watch as our AI researches each candidate across the web",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Reports",
      description: "Get detailed insights and rankings for informed decisions",
      gradient: "from-green-500 to-blue-600"
    }
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb delay={0} size={120} color="blue" />
        <FloatingOrb delay={2} size={80} color="orange" />
        <FloatingOrb delay={4} size={100} color="purple" />
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/30 to-orange-50/30" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.4) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <motion.div
        className="relative text-center py-16 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ 
          duration: 0.6,
          staggerChildren: 0.2
        }}
      >
        {/* Logo and Branding */}
        <motion.div 
          className="flex items-center justify-center mb-8"
          variants={logoVariants}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
            duration: 0.8
          }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Briefcase className="h-14 w-14 text-jobhatch-orange mr-4 drop-shadow-lg" />
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </motion.div>
          </motion.div>
          <div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              JobHatch
            </motion.h1>
            <motion.p 
              className="text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Enterprise AI
            </motion.p>
          </div>
        </motion.div>

        {/* Main Heading with Typing Effect */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-5xl md:text-7xl font-black leading-tight mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span 
              className="block prismatic-text"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Find Your
            </motion.span>
            <motion.span 
              className="block gradient-text"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Perfect Candidate
            </motion.span>
            <motion.span 
              className="block prismatic-text"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              in Minutes
            </motion.span>
          </motion.h2>
        </motion.div>

        {/* Enhanced Subtitle */}
        <motion.p 
          className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          🚀 <strong>AI-powered</strong> resume screening that analyzes candidates across{' '}
          <span className="text-blue-600 font-semibold">LinkedIn</span>, {' '}
          <span className="text-gray-800 font-semibold">GitHub</span>, and{' '}
          <span className="text-orange-600 font-semibold">personal portfolios</span> to find the perfect match for your role.
        </motion.p>

        {/* Animated Feature Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative liquid-glass-strong rounded-3xl p-8 shadow-modern-lg morph-hover transition-all duration-300 overflow-hidden reflection-card">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -top-full group-hover:top-full bg-gradient-to-b from-transparent via-white/20 to-transparent transform transition-transform duration-1000 ease-out" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA Button */}
        <motion.div
          variants={itemVariants}
          className="mb-16"
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.button
            onClick={goToNextStep}
            className="btn-jobhatch-primary shadow-glow-orange group text-xl relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
          >
            {/* Button Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Button Content */}
            <span className="relative flex items-center">
              🚀 Get Started Now
              <motion.div
                className="ml-3"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="h-6 w-6" />
              </motion.div>
            </span>

            {/* Pulse Effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-110 transition-transform duration-300" />
          </motion.button>
        </motion.div>

        {/* Animated Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {[
            { icon: Users, value: 500, suffix: '+', label: 'Companies Trust Us' },
            { icon: Award, value: 95, suffix: '%', label: 'Accuracy Rate' },
            { icon: Clock, value: 5, suffix: ' Min', label: 'Average Analysis' },
            { icon: BarChart3, value: 10, suffix: 'K+', label: 'Resumes Analyzed' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center group"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6 + index * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-3 shadow-glow-blue transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </motion.div>
              <div className="text-3xl font-black mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Action Hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, -10, 0]
          }}
          transition={{ 
            opacity: { delay: 2, duration: 0.5 },
            y: { repeat: Infinity, duration: 2, delay: 2 }
          }}
        >
          <div className="text-gray-400 text-sm">
            ↓ Scroll or click to continue
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 