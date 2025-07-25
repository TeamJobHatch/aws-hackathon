'use client'

import { ArrowRight, Briefcase } from 'lucide-react'

interface WelcomeStepProps {
  goToNextStep: () => void
}

export default function WelcomeStep({ goToNextStep }: WelcomeStepProps) {
  return (
    <div className="text-center py-16">
      {/* Logo and Branding */}
      <div className="flex items-center justify-center mb-8">
        <Briefcase className="h-12 w-12 text-jobhatch-orange mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">JobHatch</h1>
          <p className="text-sm text-jobhatch-orange font-semibold">Enterprise</p>
        </div>
      </div>

      {/* Main Heading */}
      <div className="heading-xl">
        <span className="text-jobhatch-orange">Find Your</span><br />
        <span className="text-jobhatch-blue">Perfect Candidate</span><br />
        <span className="text-jobhatch-orange">Within</span><br />
        <span className="text-jobhatch-blue">Minutes</span>
      </div>

      {/* Subtitle */}
      <p className="text-subtitle">
        AI-powered resume screening that analyzes candidates across multiple platforms 
        including LinkedIn, GitHub, and personal portfolios to find the perfect match for your role.
      </p>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="jobhatch-card-small">
          <div className="text-2xl mb-3">🎯</div>
          <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
          <p className="text-sm text-gray-600">
            AI analyzes technical skills, experience, and cultural fit
          </p>
        </div>

        <div className="jobhatch-card-small">
          <div className="text-2xl mb-3">⚡</div>
          <h3 className="font-semibold text-gray-900 mb-2">Real-time Analysis</h3>
          <p className="text-sm text-gray-600">
            Watch as our AI researches each candidate across the web
          </p>
        </div>

        <div className="jobhatch-card-small">
          <div className="text-2xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Reports</h3>
          <p className="text-sm text-gray-600">
            Get detailed insights and rankings for informed decisions
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={goToNextStep}
        className="btn-jobhatch-primary inline-flex items-center text-lg"
      >
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-3 gap-8">
        <div>
          <div className="text-2xl font-bold text-jobhatch-blue">500+</div>
          <div className="text-sm text-gray-600">Companies Trust Us</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-jobhatch-blue">95%</div>
          <div className="text-sm text-gray-600">Accuracy Rate</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-jobhatch-blue">5 Min</div>
          <div className="text-sm text-gray-600">Average Analysis Time</div>
        </div>
      </div>
    </div>
  )
} 