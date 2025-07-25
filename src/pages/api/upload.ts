import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import mammoth from 'mammoth'
import pdf from 'pdf-parse'

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads'
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'))
    }
  }
})

// Helper function to run multer middleware
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

// Helper function to extract text from uploaded files
async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdf(dataBuffer)
      return data.text
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath })
      return result.value
    } else if (mimeType === 'application/msword') {
      // For .doc files, you might need additional libraries like 'word-extractor'
      // For now, we'll return a placeholder
      return 'Document content extraction not available for .doc files. Please convert to .docx or .pdf format.'
    }
    return ''
  } catch (error) {
    console.error('Error extracting text from file:', error)
    throw new Error('Failed to extract text from file')
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Run the multer middleware
    await runMiddleware(req, res, upload.single('file'))

    const file = (req as any).file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Extract text from the uploaded file
    const textContent = await extractTextFromFile(file.path, file.mimetype)

    // Determine file type
    let fileType: 'pdf' | 'docx'
    if (file.mimetype === 'application/pdf') {
      fileType = 'pdf'
    } else {
      fileType = 'docx'
    }

    // Create response object
    const uploadedFile = {
      id: Date.now().toString(),
      name: file.originalname,
      type: fileType,
      content: textContent,
      uploadedAt: new Date()
    }

    // Clean up the uploaded file from disk
    fs.unlinkSync(file.path)

    res.status(200).json(uploadedFile)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to process uploaded file' })
  }
}

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
} 