'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X } from 'lucide-react'
import { UploadedFile } from '@/types'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'

interface FileUploaderProps {
  uploadedFiles: UploadedFile[]
  setUploadedFiles: (files: UploadedFile[]) => void
}

export default function FileUploader({ uploadedFiles, setUploadedFiles }: FileUploaderProps) {
  const uploadMutation = useMutation(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      return response.json()
    },
    {
      onSuccess: (data) => {
        setUploadedFiles([...uploadedFiles, data])
        toast.success('File uploaded successfully!')
      },
      onError: () => {
        toast.error('Failed to upload file. Please try again.')
      }
    }
  )

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate(file)
    })
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId))
    toast.success('File removed')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Documents</h2>
        <p className="text-gray-600">
          Upload your resume, cover letters, or any job-related documents (PDF, DOC, DOCX)
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {uploadMutation.isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="spinner mr-2"></div>
          <span className="text-gray-600">Uploading and processing file...</span>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.type.toUpperCase()} • Uploaded {file.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 