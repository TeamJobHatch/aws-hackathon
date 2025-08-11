# RecruitAI Project Handoff Documentation

## 🏢 Project Overview

**RecruitAI** is an AI-powered HR resume screening and candidate analysis platform designed to streamline the recruitment process. The application allows HR professionals to upload job descriptions and candidate resumes, then uses OpenAI's GPT models to provide intelligent matching, skill assessment, and candidate ranking.

**Project Name**: `recruitai-hr-screening`  
**Version**: 1.0.0  
**Live URL**: [Deployed on Vercel](https://vercel.com)  
**Repository**: AWS Hackathon Project

---

## 🛠️ Tech Stack

### **Frontend Framework**
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with modern hooks
- **TypeScript** - Type-safe development

### **Styling & UI**
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Framer Motion 12** - Animation library for smooth transitions
- **Lucide React** - Modern icon library
- **Custom JobHatch Theme** - Professional HR-focused design system

### **AI & Machine Learning**
- **OpenAI GPT-4o** - Primary AI for resume analysis and matching
- **Google Gemini 2.5** - Alternative AI model with fast processing
- **Model Selection** - User can choose between OpenAI and Gemini
- **Enhanced Analysis** - Processing time tracking and confidence scoring

### **File Processing**
- **PDF-parse** - PDF document processing
- **Mammoth** - Microsoft Word document processing (.doc/.docx)
- **Multer** - File upload handling (up to 10MB)

### **State Management**
- **React Query** - Server state management and caching
- **Zustand** - Client-side state management
- **Custom wizard state** - Multi-step form management

### **External Integrations**
- **@octokit/rest** - GitHub API integration for developer analysis
- **LinkedIn API** - Professional profile analysis (planned)
- **Axios** - HTTP client for API requests

### **Development Tools**
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### **Deployment**
- **Vercel** - Production deployment platform
- **Node.js 18+** - Runtime environment

---

## 🎯 Core Features

### **1. Multi-Step Wizard Interface**
- **Welcome Step**: Introduction and feature overview
- **Job Description Step**: Upload or manual entry of job descriptions
- **Confirm Details Step**: Review and validate job information
- **Model Selection Step**: Choose between OpenAI GPT-4o and Google Gemini 2.5
- **Resume Upload Step**: Bulk upload of candidate resumes
- **Analysis Progress Step**: Real-time AI analysis with progress tracking
- **Results Step**: Comprehensive candidate rankings and insights

### **2. AI-Powered Resume Analysis**
- **Skill Matching**: Detailed skill assessment with confidence scores
- **Experience Evaluation**: Years of experience vs. requirements
- **Match Percentage**: Overall candidate-job fit scoring
- **Strengths & Weaknesses**: Detailed candidate assessment
- **Recommendations**: Actionable insights for each candidate

### **3. File Processing Capabilities**
- **Multiple Formats**: PDF, DOC, DOCX, TXT support
- **Batch Processing**: Multiple resume uploads
- **Text Extraction**: Intelligent content parsing
- **Error Handling**: Graceful file processing failures

### **4. Professional Dashboard**
- **Candidate Rankings**: Automatic sorting by match score
- **Detailed Insights**: Expandable analysis cards
- **Progress Tracking**: Real-time analysis status
- **Clean UI**: HR-focused professional interface

### **5. Future Features (In Development)**
- **GitHub Integration**: Technical analysis for developer positions
- **LinkedIn Research**: Professional profile verification
- **Web Research**: Portfolio and personal website analysis
- **Export Reports**: Analysis report generation

---

## 📁 Project Structure

```
aws-hackathon/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── globals.css           # Global styles & JobHatch theme
│   │   ├── layout.tsx            # Root layout component
│   │   ├── page.tsx              # Home page with HRWizard
│   │   └── providers.tsx         # Context providers
│   │
│   ├── 📁 components/            # React Components
│   │   ├── Footer.tsx            # Footer component
│   │   ├── HRWizard.tsx          # Main wizard orchestrator
│   │   └── 📁 steps/             # Wizard step components
│   │       ├── WelcomeStep.tsx           # Landing/intro step
│   │       ├── JobDescriptionStep.tsx    # Job upload/entry
│   │       ├── ConfirmJobDetails.tsx     # Job review
│   │       ├── ResumeUploadStep.tsx      # Resume upload
│   │       ├── AnalysisProgressStep.tsx  # AI analysis progress
│   │       └── ResultsStep.tsx           # Final results
│   │
│   ├── 📁 pages/api/             # API Routes (Next.js API)
│   │   ├── analyze-resume.ts     # 🔥 Main resume analysis endpoint
│   │   ├── upload.ts             # File upload & job description parsing
│   │   ├── test-openai.ts        # OpenAI API connection testing
│   │   ├── github-analyzer.ts    # GitHub profile analysis
│   │   ├── linkedin-analyzer.ts  # LinkedIn profile analysis
│   │   ├── fetch-job-link.ts     # Job posting URL processing
│   │   └── 📁 github/            # GitHub-specific endpoints
│   │
│   └── 📁 types/                 # TypeScript Definitions
│       └── index.ts              # All interface definitions
│
├── 📁 testing/                   # Test Files
│   ├── CV-Simon-Tian-250125.docx # Sample resume
│   ├── CV-Simon-Tian-250125.pdf  # Sample resume
│   └── JD - Web Dev.pdf          # Sample job description
│
├── 📄 Configuration Files
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS setup
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.js             # PostCSS configuration
├── vercel.json                   # Vercel deployment settings
├── package.json                  # Dependencies & scripts
└── README.md                     # Project documentation
```

---

## 🔑 Key Components Deep Dive

### **HRWizard.tsx** - Main Orchestrator
- **State Management**: Centralized wizard state with TypeScript interfaces
- **Step Navigation**: Forward/backward navigation with validation
- **API Status**: Real-time OpenAI API connection monitoring
- **Progress Tracking**: Visual step indicator with completion states

### **API Endpoints**

#### **🔥 `/api/analyze-resume-enhanced.ts`** - Enhanced Analysis Engine
- **Purpose**: Main resume analysis with model selection support
- **Input**: Job description + candidate resumes + selected AI model
- **AI Models**: OpenAI GPT-4o or Google Gemini 2.5 (user selectable)
- **Output**: Enhanced `ResumeAnalysis` objects with processing metrics

#### **🧪 `/api/test-ai-models.ts`** - Model Testing & Status
- **Purpose**: Tests both OpenAI and Gemini API availability
- **Output**: Model status, performance metrics, and recommendations

#### **📤 `/api/upload.ts`** - File Processing
- **File Support**: PDF, DOC, DOCX, TXT (10MB limit)
- **Text Extraction**: PDF-parse, Mammoth for Word docs
- **Job Parsing**: AI-powered job description structuring

#### **🔍 `/api/test-openai.ts`** - API Health Check
- **Purpose**: Validates OpenAI API key and model availability
- **Status Reporting**: Real-time API status in UI

### **Step Components**
Each step is a self-contained React component with consistent props:
- `state`: Current wizard state
- `updateState`: State update function
- `goToNextStep` / `goToPreviousStep`: Navigation functions
- `goToStep`: Direct navigation to specific step

---

## 🎨 Design System

### **JobHatch Theme**
- **Primary Colors**: Blue (#a8d4ff), Orange (#ff7834)
- **Background**: Gradient mesh with animated particles
- **Cards**: Glassmorphism with backdrop blur and subtle shadows
- **Animations**: Framer Motion for smooth transitions

### **CSS Architecture**
- **Global Styles**: Custom CSS variables and theme system
- **Tailwind Extensions**: Custom colors, animations, and utilities
- **Component Styles**: Utility-first approach with custom classes

---

## 🔧 Environment Setup

### **Required Environment Variables**
```bash
# .env.local (NEVER commit this file)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=AIzaSyBYjTcieXPJaoHgx6GliMrvX8XHlqCv61o
DEFAULT_AI_MODEL=openai
```

### **Development Commands**
```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### **Prerequisites**
- **Node.js 18+** and npm
- **OpenAI API Key** with GPT-4 access
- **Git** for version control

---

## 🚀 Deployment

### **Current Deployment: Vercel**
- **Platform**: Vercel (recommended for Next.js)
- **Configuration**: `vercel.json` with Next.js framework detection
- **Environment Variables**: Set in Vercel dashboard
- **Domain**: Auto-deployed from main branch

### **Deployment Steps**
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add `OPENAI_API_KEY` in Vercel environment settings
4. Deploy automatically on push to main

---

## 🔄 Current State & Workflow

### **Completed Features** ✅
- Multi-step wizard interface with smooth animations
- Job description upload and parsing
- Resume upload with multiple file format support
- AI-powered resume analysis with detailed scoring
- Candidate ranking and comparison
- Professional UI with glassmorphism design
- Real-time API status monitoring
- Comprehensive TypeScript type system

### **In Progress** 🚧
- GitHub profile analysis for technical roles
- LinkedIn profile verification
- Web research capabilities
- Enhanced error handling and user feedback

### **User Journey**
1. **Welcome**: Feature introduction and API status check
2. **Job Description**: Upload PDF/DOC or manual entry
3. **Confirm Details**: Review parsed job information
4. **Model Selection**: Choose between OpenAI GPT-4o and Google Gemini 2.5
5. **Resume Upload**: Bulk upload candidate resumes
6. **Analysis**: Watch real-time AI processing with progress steps
7. **Results**: View ranked candidates with detailed insights

---

## 📊 Data Flow

### **Analysis Pipeline**
```
Job Description → AI Parsing → Structured Data
                                     ↓
Resumes → Text Extraction → AI Analysis → Scoring
                                     ↓
Final Results → Candidate Rankings → UI Display
```

### **State Management**
- **Wizard State**: Centralized in `HRWizard.tsx`
- **File Processing**: Temporary storage during analysis
- **API Responses**: Cached with React Query
- **UI State**: Framer Motion for animations

---

## 🔍 Key Code Patterns

### **File Upload Handling**
```typescript
// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})
```

### **AI Analysis Structure**
```typescript
interface ResumeAnalysis {
  matchPercentage: number
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  skillsMatch: SkillMatch[]
  recommendations: string[]
  // ... detailed analysis fields
}
```

### **Wizard Navigation**
```typescript
const goToNextStep = () => {
  const currentIndex = getCurrentStepIndex()
  if (currentIndex < steps.length - 1) {
    const nextStep = steps[currentIndex + 1].id
    updateState({ currentStep: nextStep })
  }
}
```

---

## 🆕 Latest Updates & New Features

### **✅ Recently Added - January 2025**
1. **Dual AI Model Support**
   - Added Google Gemini 2.5 as alternative to OpenAI GPT-4o
   - User-selectable model choice in new wizard step
   - Real-time model status testing and recommendations

2. **Enhanced Analysis Pipeline**
   - New `/api/analyze-resume-enhanced.ts` endpoint with model selection
   - Processing time tracking and confidence scoring
   - Improved error handling and response formatting

3. **Model Selection UI**
   - Beautiful model selector component with status indicators
   - Real-time API testing and availability checking
   - Animated model cards with feature comparisons

4. **Fake Test Data System**
   - Comprehensive fake job descriptions and resumes
   - Realistic analysis results for demo purposes
   - Test endpoint for development and debugging

5. **Updated Project Architecture**
   - 7-step wizard flow (added model selection step)
   - Enhanced TypeScript interfaces for AI models
   - Updated environment configuration for dual APIs

---

## 🎯 Next Steps & Roadmap

### **Immediate Priorities** (Next 1-2 Sprints)
1. **Error Handling Enhancement**
   - Improve file upload error messages
   - Add retry mechanisms for failed API calls
   - Better handling of unsupported file formats

2. **GitHub Integration Completion**
   - Finish `github-analyzer.ts` implementation
   - Add repository analysis and code quality metrics
   - Integrate GitHub scores into overall candidate ranking

3. **Performance Optimizations**
   - Implement file upload progress indicators
   - Add loading skeletons for better UX
   - Optimize large file processing

### **Medium-term Goals** (Next 1-2 Months)
1. **LinkedIn Integration**
   - Complete LinkedIn profile analysis
   - Add professional background verification
   - Cross-reference resume claims with LinkedIn data

2. **Export and Reporting**
   - PDF report generation for candidate analyses
   - Excel export for candidate rankings
   - Shareable analysis links

3. **Batch Processing**
   - Multiple job description comparisons
   - Bulk candidate analysis
   - Historical analysis tracking

### **Long-term Vision** (3-6 Months)
1. **ATS Integration**
   - Connect with popular ATS systems
   - Automated candidate pipeline
   - Integration with recruitment workflows

2. **Advanced Analytics**
   - Hiring success rate tracking
   - Bias detection and mitigation
   - Predictive hiring analytics

3. **Customization Features**
   - Custom scoring criteria
   - Industry-specific analysis models
   - White-label solutions

---

## 🐛 Known Issues & Limitations

### **Current Limitations**
1. **File Size**: 10MB upload limit per file
2. **API Rate Limits**: OpenAI API rate limiting may affect batch processing
3. **File Types**: Limited to PDF, DOC, DOCX, TXT
4. **Analysis Speed**: GPT-4 calls can take 10-30 seconds per resume

### **Technical Debt**
1. **Error Boundaries**: Need React error boundaries for better error handling
2. **Testing**: No unit tests currently implemented
3. **Accessibility**: ARIA labels and keyboard navigation need improvement
4. **Mobile Optimization**: Some components need mobile responsiveness work

### **Security Considerations**
- API keys are properly stored in environment variables
- File uploads are processed in memory (not stored permanently)
- No user authentication currently implemented
- All API calls are server-side to protect credentials

---

## 💡 Development Tips

### **Working with the Codebase**
1. **State Updates**: Always use the `updateState` function to maintain consistency
2. **File Processing**: Handle errors gracefully as file parsing can fail
3. **AI Responses**: Always validate OpenAI responses for proper formatting
4. **Animations**: Use Framer Motion variants for consistent animation patterns

### **Debugging**
1. **API Issues**: Check `/api/test-openai` endpoint first
2. **File Upload**: Monitor browser network tab for upload progress
3. **State Management**: Use React DevTools to inspect wizard state
4. **TypeScript**: Leverage TypeScript strict mode for better error catching

### **Performance Tips**
1. **Lazy Loading**: Consider lazy loading for step components
2. **API Caching**: React Query handles caching, but consider longer cache times
3. **Bundle Size**: Monitor bundle size with Next.js analyzer
4. **Image Optimization**: Use Next.js Image component for any future images

---

## 📞 Support & Contact

### **Development Handoff**
- **Primary Developer**: [Previous Developer Name]
- **Code Review**: All changes should go through PR review
- **Documentation**: Update this document for any architectural changes
- **Testing**: Test all file upload scenarios before deployment

### **Deployment Access**
- **Vercel**: [Access credentials/team invitation needed]
- **GitHub**: [Repository access required]
- **OpenAI**: [API key management and billing access]

---

## 📚 Additional Resources

### **External Documentation**
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion API](https://www.framer.com/motion/)

### **Project-Specific Resources**
- `README.md` - Setup and basic usage instructions
- `src/types/index.ts` - Complete TypeScript interface definitions
- `tailwind.config.js` - Custom styling configuration
- `package.json` - Complete dependency list and scripts

---

## 📦 Current API Routes Overview

| Endpoint | Method | Function | Status |
|----------|--------|----------|---------|
| `/api/test-ai-models` | GET | Test both AI models availability | ✅ Complete |
| `/api/analyze-resume-enhanced` | POST | Enhanced analysis with model selection | ✅ Complete |
| `/api/upload` | POST | Job description and file processing | ✅ Complete |
| `/api/test-fake-data` | GET | Development test data and demos | ✅ Complete |
| `/api/analyze-resume` | POST | Legacy analysis endpoint | ✅ Complete |
| `/api/github-analyzer` | POST | GitHub profile analysis | 🚧 In Progress |
| `/api/linkedin-analyzer` | POST | LinkedIn profile analysis | 🚧 In Progress |

### **Test Endpoints for Development**
- `/api/test-fake-data?type=jobs` - Sample job descriptions
- `/api/test-fake-data?type=resumes` - Sample candidate resumes  
- `/api/test-fake-data?type=analysis&model=openai` - Sample analysis with OpenAI
- `/api/test-fake-data?type=demo&model=gemini` - Complete demo with Gemini

### **Future API Endpoints (From PRD)**
| Endpoint | Method | Function | Priority |
|----------|--------|----------|----------|
| `/api/job/vectorize` | POST | JD upload → vectorize + parse | High |
| `/api/resumes/batch` | POST | Batch upload → extract + embed | High |
| `/api/candidate/feedback` | POST | Feedback + behavior log | Medium |
| `/api/job/{id}/insights` | GET | Feedback insights → prompt optimization | Medium |

---

**Document Last Updated**: January 2025  
**Next Review Date**: [Set based on development cycle]

---

*This document should be updated whenever significant architectural changes, new features, or major bug fixes are implemented. Keep it as the single source of truth for project handoffs.* 