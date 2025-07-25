# JobHatch AI Assistant

An AI-powered job application assistant built with Next.js, React, and OpenAI's ChatGPT API. This application helps job seekers optimize their resumes, write cover letters, prepare for interviews, and manage their professional portfolios.

## Features

- 🤖 **AI Chat Assistant**: ChatGPT-powered assistant for job application help
- 📄 **Document Upload**: Upload and analyze PDFs and Word documents
- 🐙 **GitHub Integration**: Connect your GitHub profile to showcase projects
- 💼 **LinkedIn Integration**: Add LinkedIn profile information
- 🎨 **Portfolio Management**: Manage your professional portfolio links
- 🎯 **Job Application Assistance**: Get personalized advice and feedback

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-3.5 Turbo
- **File Processing**: PDF parsing, Word document processing
- **API Integration**: GitHub REST API
- **State Management**: React Query, Zustand
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- GitHub Personal Access Token (optional, for higher rate limits)

## Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd aws-hackathon
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and add your API keys:
   \`\`\`env
   OPENAI_API_KEY=your_openai_api_key_here
   GITHUB_TOKEN=your_github_personal_access_token (optional)
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (for GitHub integration with higher rate limits)
GITHUB_TOKEN=your_github_personal_access_token

# Development
NODE_ENV=development
\`\`\`

### Getting API Keys

1. **OpenAI API Key**: 
   - Visit [OpenAI API](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Add billing information to use the API

2. **GitHub Token** (Optional):
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `public_repo` scope
   - This increases API rate limits from 60 to 5000 requests per hour

## Project Structure

\`\`\`
aws-hackathon/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── globals.css      # Global styles
│   │   └── providers.tsx    # React Query provider
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── ChatInterface.tsx# AI chat component
│   │   ├── FileUploader.tsx # File upload component
│   │   ├── GitHubIntegration.tsx
│   │   ├── LinkedInIntegration.tsx
│   │   └── PortfolioManager.tsx
│   ├── pages/api/           # API routes
│   │   ├── chat.ts          # ChatGPT API endpoint
│   │   ├── upload.ts        # File upload endpoint
│   │   └── github/[username].ts # GitHub API endpoint
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── next.config.js          # Next.js configuration
\`\`\`

## Features Overview

### AI Chat Assistant
- Powered by OpenAI GPT-3.5 Turbo
- Contextual assistance using uploaded documents
- Specialized prompts for job application help
- Resume optimization suggestions
- Cover letter writing assistance
- Interview preparation tips

### Document Processing
- Upload PDF and Word documents
- Extract and analyze text content
- Use document content as context for AI responses
- Support for resumes, cover letters, and job descriptions

### GitHub Integration
- Connect GitHub profiles by username
- Display profile information and statistics
- Showcase top repositories
- Filter out forked repositories
- Sort repositories by popularity

### Portfolio Management
- Add and organize portfolio items
- Categorize projects (Website, Project, Blog, Other)
- Include descriptions and direct links
- Edit and delete portfolio items

## API Endpoints

### POST /api/chat
Chat with the AI assistant
- **Body**: `{ message: string, uploadedFiles?: Array<{name: string, content: string}> }`
- **Response**: `{ message: string }`

### POST /api/upload
Upload and process documents
- **Body**: FormData with file
- **Response**: `{ id: string, name: string, type: string, content: string, uploadedAt: Date }`

### GET /api/github/[username]
Fetch GitHub profile and repositories
- **Response**: GitHub profile with top repositories

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**
   Add these in your Vercel project settings:
   - `OPENAI_API_KEY`
   - `GITHUB_TOKEN` (optional)

## Usage Guide

1. **Getting Started**
   - Visit the application homepage
   - Navigate through different tabs to explore features

2. **Upload Documents**
   - Go to the "Documents" tab
   - Drag and drop or click to upload PDF/Word files
   - Wait for processing to complete

3. **Chat with AI**
   - Switch to "AI Assistant" tab
   - Start asking questions about job applications
   - AI will use your uploaded documents for context

4. **Connect GitHub**
   - Go to "GitHub" tab
   - Enter your GitHub username
   - View your profile and top repositories

5. **Manage Portfolio**
   - Use "Portfolio" tab to add professional links
   - Categorize and describe your projects
   - Include direct links to your work

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the GitHub Issues page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## Roadmap

- [ ] Advanced resume analysis with scoring
- [ ] Job board integration
- [ ] Email templates for job applications
- [ ] Interview question bank
- [ ] Application tracking system
- [ ] LinkedIn API integration (when available)
- [ ] Multi-language support 