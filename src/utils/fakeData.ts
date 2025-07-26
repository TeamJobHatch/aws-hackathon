import { JobDescription, Resume, EnhancedResumeAnalysis } from '@/types'

// Fake Job Descriptions
export const fakeJobDescriptions: JobDescription[] = [
  {
    id: 'job_001',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Inc.',
    description: 'We are seeking a highly skilled Senior Full Stack Developer to join our dynamic team. The ideal candidate will have extensive experience with modern web technologies, cloud platforms, and agile development methodologies.',
    requirements: [
      '5+ years of professional development experience',
      'Proficiency in React, Node.js, and TypeScript',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Strong understanding of database design and optimization',
      'Experience with CI/CD pipelines and DevOps practices'
    ],
    qualifications: [
      "Bachelor's degree in Computer Science or related field",
      'Strong problem-solving and analytical skills',
      'Excellent communication and teamwork abilities',
      'Experience with Agile/Scrum methodologies',
      'Portfolio of completed projects'
    ],
    skills: [
      'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python',
      'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'Git',
      'REST APIs', 'GraphQL', 'Redis', 'Microservices'
    ],
    experience: '5+ years',
    location: 'San Francisco, CA (Remote)',
    salary: '$120,000 - $160,000',
    uploadedAt: new Date('2025-01-15'),
    content: 'Senior Full Stack Developer position at TechCorp Inc. requiring React, Node.js, TypeScript, and cloud experience...'
  },
  {
    id: 'job_002',
    title: 'Data Scientist',
    company: 'DataFlow Solutions',
    description: 'Join our AI/ML team to build cutting-edge data science solutions. You will work on machine learning models, data pipelines, and analytics dashboards that drive business insights.',
    requirements: [
      '3+ years in data science or ML engineering',
      'Proficiency in Python, R, or Scala',
      'Experience with ML frameworks (TensorFlow, PyTorch, Scikit-learn)',
      'Strong statistical analysis and modeling skills',
      'Experience with big data tools (Spark, Hadoop)'
    ],
    qualifications: [
      "Master's degree in Data Science, Statistics, or related field",
      'Experience with cloud ML platforms',
      'Strong mathematical and statistical background',
      'Experience with data visualization tools',
      'Publication record preferred'
    ],
    skills: [
      'Python', 'R', 'TensorFlow', 'PyTorch', 'Scikit-learn',
      'Pandas', 'NumPy', 'SQL', 'Tableau', 'Power BI',
      'AWS', 'Spark', 'Jupyter', 'Git', 'Docker'
    ],
    experience: '3+ years',
    location: 'New York, NY (Hybrid)',
    salary: '$100,000 - $140,000',
    uploadedAt: new Date('2025-01-14'),
    content: 'Data Scientist role focusing on machine learning, statistical analysis, and big data processing...'
  },
  {
    id: 'job_003',
    title: 'Product Manager',
    company: 'InnovateTech',
    description: 'Lead product strategy and development for our SaaS platform. Work cross-functionally with engineering, design, and marketing teams to deliver exceptional user experiences.',
    requirements: [
      '4+ years of product management experience',
      'Experience with SaaS products and B2B markets',
      'Strong analytical and data-driven decision making',
      'Experience with product roadmap planning',
      'Excellent stakeholder management skills'
    ],
    qualifications: [
      "Bachelor's degree in Business, Engineering, or related field",
      'MBA preferred',
      'Experience with Agile development processes',
      'Strong presentation and communication skills',
      'Customer-focused mindset'
    ],
    skills: [
      'Product Strategy', 'Roadmap Planning', 'Market Research',
      'User Experience', 'Analytics', 'SQL', 'Tableau',
      'Jira', 'Confluence', 'Figma', 'A/B Testing',
      'Stakeholder Management', 'Project Management'
    ],
    experience: '4+ years',
    location: 'Austin, TX (Remote)',
    salary: '$110,000 - $150,000',
    uploadedAt: new Date('2025-01-13'),
    content: 'Product Manager position requiring strategic thinking, stakeholder management, and SaaS experience...'
  }
]

// Fake Resume Analysis Data
export const generateFakeAnalysis = (candidateName: string, jobTitle: string, aiModel: 'openai' | 'gemini'): EnhancedResumeAnalysis => {
  const baseMatchPercentage = Math.floor(Math.random() * 40) + 60 // 60-100%
  const processingTime = Math.floor(Math.random() * 3000) + 1000 // 1-4 seconds
  
  return {
    matchPercentage: baseMatchPercentage,
    overallScore: baseMatchPercentage + Math.floor(Math.random() * 10) - 5,
    strengths: [
      `Strong technical background in ${jobTitle.toLowerCase()} technologies`,
      `Proven track record of delivering complex projects`,
      `Excellent problem-solving and analytical skills`,
      `Good cultural fit based on communication style`
    ].slice(0, Math.floor(Math.random() * 2) + 2),
    weaknesses: [
      `Limited experience with some required technologies`,
      `Could benefit from more leadership experience`,
      `Gaps in recent project portfolio`,
      `Missing specific industry experience`
    ].slice(0, Math.floor(Math.random() * 2) + 1),
    skillsMatch: [
      {
        skill: 'JavaScript',
        found: true,
        confidence: 95,
        evidence: ['3 years React development', 'Node.js backend experience']
      },
      {
        skill: 'Python',
        found: Math.random() > 0.3,
        confidence: Math.floor(Math.random() * 30) + 70,
        evidence: ['Data analysis projects', 'ML model development']
      },
      {
        skill: 'AWS',
        found: Math.random() > 0.4,
        confidence: Math.floor(Math.random() * 40) + 60,
        evidence: ['Cloud deployment experience', 'Infrastructure management']
      }
    ],
    experienceMatch: {
      requiredYears: 5,
      candidateYears: Math.floor(Math.random() * 3) + 3,
      relevantExperience: [
        'Full-stack web development',
        'Agile development methodologies',
        'Team collaboration and mentoring'
      ],
      score: Math.floor(Math.random() * 20) + 80
    },
    recommendations: [
      `${candidateName} shows strong potential for this role`,
      `Consider for technical interview round`,
      `Verify specific technology experience during interview`,
      `Good candidate for team culture assessment`
    ].slice(0, Math.floor(Math.random() * 2) + 2),
    summary: `${candidateName} is a ${baseMatchPercentage > 80 ? 'strong' : baseMatchPercentage > 70 ? 'good' : 'moderate'} candidate for the ${jobTitle} position. They demonstrate solid technical skills and relevant experience, though some areas may need further evaluation during the interview process.`,
    detailedInsights: [
      `Technical skills align well with job requirements`,
      `Communication style suggests good team fit`,
      `Project experience shows progressive responsibility`,
      `Educational background supports technical requirements`
    ],
    technicalSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker'],
    softSkills: ['Communication', 'Teamwork', 'Problem Solving', 'Leadership'],
    aiModel: aiModel,
    modelVersion: aiModel === 'openai' ? 'gpt-4o' : 'gemini-1.5-flash',
    processingTime: processingTime,
    confidence: aiModel === 'openai' ? Math.min(95, baseMatchPercentage + 5) : Math.min(90, baseMatchPercentage)
  }
}

// Fake Resume Data
export const fakeResumes: Resume[] = [
  {
    id: 'resume_001',
    candidateName: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '+1 (555) 123-4567',
    filename: 'alice_johnson_resume.pdf',
    content: `Alice Johnson
Senior Software Engineer

Contact: alice.johnson@email.com | (555) 123-4567 | San Francisco, CA

EXPERIENCE
Senior Software Engineer - TechStart Inc. (2021-2024)
• Led development of React-based dashboard serving 50K+ users
• Implemented microservices architecture using Node.js and AWS
• Mentored 3 junior developers and improved team velocity by 40%

Software Engineer - WebFlow Solutions (2019-2021)
• Built responsive web applications using React and TypeScript
• Developed REST APIs and integrated with PostgreSQL databases
• Collaborated with cross-functional teams in Agile environment

EDUCATION
B.S. Computer Science - Stanford University (2019)

SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frameworks: React, Node.js, Express, Django
Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
Databases: PostgreSQL, MongoDB, Redis`,
    uploadedAt: new Date('2025-01-15'),
    analysis: generateFakeAnalysis('Alice Johnson', 'Senior Full Stack Developer', 'openai'),
    links: {
      github: 'https://github.com/alice-johnson',
      linkedin: 'https://linkedin.com/in/alice-johnson',
      portfolio: 'https://alicejohnson.dev',
      other: []
    }
  },
  {
    id: 'resume_002',
    candidateName: 'Robert Chen',
    email: 'robert.chen@email.com',
    phone: '+1 (555) 987-6543',
    filename: 'robert_chen_resume.pdf',
    content: `Robert Chen
Data Scientist

Contact: robert.chen@email.com | (555) 987-6543 | New York, NY

EXPERIENCE
Senior Data Scientist - DataCorp (2020-2024)
• Developed ML models improving customer retention by 25%
• Built end-to-end data pipelines processing 1TB+ daily data
• Led A/B testing framework reducing experimental cycle time

Data Analyst - Analytics Plus (2018-2020)
• Created Tableau dashboards for executive reporting
• Performed statistical analysis on customer behavior data
• Automated data quality checks reducing manual effort by 60%

EDUCATION
M.S. Data Science - MIT (2018)
B.S. Mathematics - UC Berkeley (2016)

SKILLS
Languages: Python, R, SQL, Scala
ML/AI: TensorFlow, PyTorch, Scikit-learn, XGBoost
Tools: Jupyter, Tableau, Git, Docker, Airflow
Cloud: AWS (SageMaker, Redshift), Snowflake`,
    uploadedAt: new Date('2025-01-14'),
    analysis: generateFakeAnalysis('Robert Chen', 'Data Scientist', 'gemini'),
    links: {
      github: 'https://github.com/robert-chen',
      linkedin: 'https://linkedin.com/in/robert-chen',
      other: []
    }
  },
  {
    id: 'resume_003',
    candidateName: 'Sarah Williams',
    email: 'sarah.williams@email.com',
    phone: '+1 (555) 456-7890',
    filename: 'sarah_williams_resume.pdf',
    content: `Sarah Williams
Product Manager

Contact: sarah.williams@email.com | (555) 456-7890 | Austin, TX

EXPERIENCE
Senior Product Manager - CloudTech (2021-2024)
• Led product strategy for SaaS platform with $10M ARR
• Managed roadmap for team of 12 engineers and 3 designers
• Launched 5 major features increasing user engagement by 35%

Product Manager - StartupFlow (2019-2021)
• Defined product vision and strategy for B2B marketplace
• Conducted user research and competitive analysis
• Coordinated with engineering and design teams using Agile

Business Analyst - Consulting Group (2017-2019)
• Analyzed market opportunities and business processes
• Created executive presentations and strategic recommendations
• Supported digital transformation initiatives

EDUCATION
MBA - Wharton School (2017)
B.A. Economics - Harvard University (2015)

SKILLS
Product: Strategy, Roadmapping, User Research, A/B Testing
Analytics: SQL, Tableau, Google Analytics, Mixpanel
Tools: Jira, Confluence, Figma, Slack, Notion
Methodologies: Agile, Scrum, Design Thinking`,
    uploadedAt: new Date('2025-01-13'),
    analysis: generateFakeAnalysis('Sarah Williams', 'Product Manager', 'openai'),
    links: {
      linkedin: 'https://linkedin.com/in/sarah-williams',
      portfolio: 'https://sarahwilliams.com',
      other: []
    }
  }
]

// Helper function to get random fake data
export const getRandomJobDescription = (): JobDescription => {
  return fakeJobDescriptions[Math.floor(Math.random() * fakeJobDescriptions.length)]
}

export const getRandomResumes = (count: number = 3): Resume[] => {
  return fakeResumes.slice(0, count)
}

export const getFakeAnalysisSummary = (resumes: Resume[]) => {
  const successfulResumes = resumes.filter(r => r.analysis)
  
  return {
    total: resumes.length,
    successful: successfulResumes.length,
    errors: resumes.length - successfulResumes.length,
    averageMatch: successfulResumes.length > 0 
      ? Math.round(successfulResumes.reduce((sum, r) => sum + (r.analysis?.matchPercentage || 0), 0) / successfulResumes.length)
      : 0,
    topCandidate: successfulResumes[0]?.candidateName || 'None',
    processingTime: successfulResumes.reduce((sum, r) => {
      const analysis = r.analysis as EnhancedResumeAnalysis
      return sum + (analysis?.processingTime || 0)
    }, 0)
  }
} 