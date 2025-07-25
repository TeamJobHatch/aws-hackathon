# RecruitAI - HR Resume Screening Platform

An AI-powered resume screening and candidate analysis platform designed for HR professionals. Upload job descriptions and candidate resumes to get intelligent insights, skill matching, and candidate rankings powered by OpenAI's GPT models.

## 🚀 Features

- **Job Description Management**: Upload or manually enter job descriptions with automatic parsing
- **AI-Powered Resume Analysis**: Intelligent analysis of candidate resumes against job requirements
- **Skill Matching**: Detailed skill assessment with confidence scores and evidence
- **Candidate Ranking**: Automatic sorting and ranking of candidates by fit score
- **GitHub Integration**: Technical analysis for developer positions (coming soon)
- **Professional Dashboard**: Clean, HR-focused interface with statistics and insights
- **Multiple File Formats**: Support for PDF, DOC, DOCX, and TXT files
- **Real-time Processing**: Fast AI analysis with progress indicators

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom HR-focused design system
- **AI/ML**: OpenAI GPT-4 for resume analysis and skill matching
- **File Processing**: PDF-parse, Mammoth (for Word docs)
- **UI Components**: Lucide React icons, React Dropzone
- **State Management**: React Query for API state management
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Git

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd aws-hackathon
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

> **⚠️ Important**: Never commit your `.env.local` file to version control. It's already included in `.gitignore`.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 How to Use

### Step 1: Upload Job Description
1. Navigate to the "Job Description" tab
2. Either upload a job description file (PDF, DOC, DOCX, TXT) or enter details manually
3. The AI will automatically extract structured information like requirements, qualifications, and skills

### Step 2: Analyze Resumes
1. Go to the "Resume Analysis" tab
2. Upload one or more candidate resumes
3. The AI will analyze each resume against the job description
4. View detailed insights including:
   - Overall match percentage
   - Skills assessment with evidence
   - Strengths and weaknesses
   - Recommendations for each candidate

### Step 3: Review Results
- Candidates are automatically ranked by their overall score
- Expand any candidate's analysis for detailed insights
- Use the GitHub Analysis tab for technical positions

## 🔧 Configuration

### OpenAI API Setup
1. Sign up at [OpenAI](https://platform.openai.com/)
2. Generate an API key
3. Add it to your `.env.local` file
4. The application uses GPT-4 for detailed analysis and GPT-3.5-turbo for data extraction

### File Upload Limits
- Maximum file size: 10MB per file
- Supported formats: PDF, DOC, DOCX, TXT
- Multiple resume uploads supported

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 📁 Project Structure

```
aws-hackathon/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── globals.css     # Global styles and HR theme
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main page
│   ├── components/         # React components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Footer.tsx      # Footer component
│   │   ├── JobDescriptionUploader.tsx
│   │   └── ResumeAnalyzer.tsx
│   ├── pages/api/          # API routes
│   │   ├── upload.ts       # File upload and processing
│   │   ├── analyze-resume.ts # Resume analysis
│   │   └── chat.ts         # General AI chat (legacy)
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── public/                 # Static assets
├── .env.local             # Environment variables (create this)
├── package.json
└── README.md
```

## 🎨 Customization

### Design System
The application uses a professional HR-focused design system defined in `globals.css`:
- Primary color: Blue (#2563eb)
- Professional card layouts
- Accessible form components
- Responsive design for all screen sizes

### AI Prompts
Customize the AI analysis prompts in:
- `src/pages/api/analyze-resume.ts` - Main resume analysis
- `src/pages/api/upload.ts` - Job description parsing

## 🔍 API Endpoints

- `POST /api/upload` - Upload and process files (job descriptions)
- `POST /api/analyze-resume` - Analyze resume against job description
- `POST /api/chat` - General AI chat functionality (legacy)

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure your OpenAI API key is correctly set in `.env.local`
   - Check that you have sufficient credits in your OpenAI account

2. **File Upload Errors**
   - Verify file size is under 10MB
   - Ensure file format is supported (PDF, DOC, DOCX, TXT)

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (18+ required)

### Getting Help

1. Check the browser console for error messages
2. Verify API responses in the Network tab
3. Ensure environment variables are properly set

## 🔒 Security Notes

- API keys are stored in environment variables only
- File uploads are processed in memory (not stored permanently)
- No user data is permanently stored
- All API calls are server-side to protect credentials

## 📈 Future Enhancements

- [ ] GitHub profile analysis for technical roles
- [ ] Batch resume processing
- [ ] Export analysis reports
- [ ] Custom scoring criteria
- [ ] Integration with ATS systems
- [ ] Advanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For technical support or questions about the HR resume screening platform, please contact the development team. 