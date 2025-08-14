'use client'

import { ArrowRight, ArrowLeft, Edit, Building, MapPin, DollarSign } from 'lucide-react'
import { JobDescription } from '@/types'

interface ConfirmJobDetailsProps {
  state: any
  updateState: (updates: any) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
}

export default function ConfirmJobDetails({ 
  state, 
  updateState, 
  goToNextStep, 
  goToPreviousStep 
}: ConfirmJobDetailsProps) {
  const jobDescription: JobDescription = state.jobDescription

  if (!jobDescription) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">No job description found. Please go back and upload one.</p>
        <button onClick={goToPreviousStep} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold mt-4 transition-colors">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Confirm Job Details</h2>
        <p className="text-lg text-gray-600">
          Please review the extracted job information before proceeding
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
        {/* Job Header */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{jobDescription.title}</h3>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              {jobDescription.company}
            </div>
            {jobDescription.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {jobDescription.location}
              </div>
            )}
            {jobDescription.salary && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                {jobDescription.salary}
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {jobDescription.description.length > 500 
                ? `${jobDescription.description.substring(0, 500)}...` 
                : jobDescription.description
              }
            </p>
          </div>
        </div>

        {/* Requirements */}
        {jobDescription.requirements.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <ul className="space-y-2">
                {jobDescription.requirements.map((req, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Qualifications */}
        {jobDescription.qualifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Preferred Qualifications</h4>
            <div className="bg-green-50 rounded-lg p-4">
              <ul className="space-y-2">
                {jobDescription.qualifications.map((qual, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    {qual}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Skills */}
        {jobDescription.skills.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Key Skills</h4>
            <div className="flex flex-wrap gap-2">
              {jobDescription.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">🤖</span>
                AI Analysis Summary
              </h4>
              <p className="text-sm text-gray-700">
                Our AI has identified{' '}
                <span className="font-semibold text-blue-600">{jobDescription.requirements.length}</span>{' '}
                key requirements
                {jobDescription.skills.length > 0 && (
                  <>
                    , <span className="font-semibold text-orange-600">{jobDescription.skills.length}</span> essential skills
                  </>
                )}
                {jobDescription.qualifications.length > 0 && (
                  <>
                    , and <span className="font-semibold text-green-600">{jobDescription.qualifications.length}</span> preferred qualifications
                  </>
                )}.
                This information will be used to match and rank candidates.
              </p>
            </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={goToPreviousStep}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Edit Job Details
        </button>
        
        <button
          onClick={goToNextStep}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors"
        >
          Proceed to Upload Resumes
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>

      {/* Additional Information */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Next: Upload candidate resumes (maximum 5 for this demo)
        </p>
      </div>
    </div>
  )
} 