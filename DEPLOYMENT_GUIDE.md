# 🚀 JobHatch Vercel Deployment Guide

## ✅ **Ready for Deployment!**

Your JobHatch HR Screening Platform is now configured with:
- ✅ **Gemini as default AI model** (Google Gemini 2.5)
- ✅ **Fixed LinkedIn & GitHub analysis** for Vercel
- ✅ **Robust fallback systems** for API failures
- ✅ **Enhanced error handling** and timeouts

## 🔑 **Environment Variables for Vercel**

### **Step 1: Set API Keys in Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these **exact** variables:

```bash
# Required - OpenAI API Key
OPENAI_API_KEY=sk-proj-CEu-OoUsDlZPd9MKX7jLlgFp48K3WsQlRhQz9zMUMm1tMniM74pw1uXoKe1gks7MpgdITPu5KExnFHwH8u6XzEfXgD8wP_N7uD2WKtz8tLHL8cOJ440xb3btZzIA

# Required - Google Gemini API Key
GEMINI_API_KEY=AIzaSyBYjTcieXPJaoHgx6GliMrvX8XHlqCv61o

# Optional - Auto-provided by Vercel
VERCEL_URL=your-project.vercel.app
```

### **Step 2: Deploy to Vercel**

#### **Option A: Deploy via Vercel CLI** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to link your project
```

#### **Option B: Deploy via Git** 
1. Push your code to GitHub/GitLab
2. Connect repository in Vercel dashboard
3. Deploy automatically on push

## 🔧 **Vercel Configuration Files**

### **vercel.json** (Already configured)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "src/pages/api/analyze-resume.ts": { "maxDuration": 60 },
    "src/pages/api/linkedin-analyzer.ts": { "maxDuration": 30 },
    "src/pages/api/github-analyzer.ts": { "maxDuration": 30 }
  }
}
```

### **next.config.js** (Already configured)
```javascript
module.exports = {
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com', 'media.licdn.com'],
  },
  api: {
    responseLimit: '8mb',
    bodyParser: { sizeLimit: '8mb' }
  }
}
```

## 📋 **Pre-Deployment Checklist**

- [ ] **API Keys Set** in Vercel environment variables
- [ ] **Build Passes Locally**: `npm run build`
- [ ] **No TypeScript Errors**: `npm run type-check`
- [ ] **All Dependencies Installed**: `npm install`
- [ ] **Git Committed**: All changes committed to Git

## 🧪 **Testing Your Deployment**

### **1. Verify API Keys Work**
Visit: `https://your-project.vercel.app/api/test-ai-models`

**Expected Response:**
```json
{
  "success": true,
  "workingModels": 2,
  "totalModels": 2,
  "models": {
    "openai": { "success": true, "apiStatus": "working" },
    "gemini": { "success": true, "apiStatus": "working" }
  }
}
```

### **2. Test Complete Workflow**
1. **Upload Resume** with LinkedIn/GitHub URLs
2. **Select AI Model** (Gemini should be pre-selected)
3. **Run Analysis** - should complete without timeouts
4. **Check Results** - LinkedIn & GitHub dropdowns should appear

### **3. Debug Issues**
- **Check Vercel Function Logs** in dashboard
- **Verify Environment Variables** are correctly set
- **Test API Endpoints** individually

## ⚡ **Performance Optimizations Applied**

- **Function Timeouts**: Extended to 60s for main analysis
- **Response Limits**: Increased to 8MB for large reports
- **Fallback Systems**: Ensure dropdowns always appear
- **Timeout Handling**: 25s timeouts for internal API calls

## 🎯 **Expected Features Working**

### **✅ Core Features:**
- Resume upload and parsing (PDF, DOCX)
- Job description analysis
- AI-powered candidate matching
- Gemini 2.5 as default AI model

### **✅ LinkedIn Analysis:**
- Profile credibility scoring
- Inconsistency detection
- Professional assessment
- Manual review recommendations (fallback)

### **✅ GitHub Analysis:**
- Repository quality assessment
- Code analysis with AI detection
- Project completeness scoring
- Technical interview recommendations (fallback)

### **✅ Results Display:**
- Ranked candidate list
- Expandable analysis dropdowns
- Clickable profile links
- Download/export options

## 🚨 **Troubleshooting**

### **Common Issues:**

| Issue | Solution |
|-------|----------|
| "No AI models available" | Check API keys in Vercel dashboard |
| LinkedIn analysis missing | Check Vercel function logs for URL errors |
| GitHub analysis missing | Verify GEMINI_API_KEY is correctly set |
| Build failures | Run `npm run build` locally first |
| Timeout errors | Check function duration limits |

### **Quick Fixes:**
1. **Redeploy** if environment variables were added
2. **Check API Quotas** (OpenAI/Gemini billing)
3. **Clear Browser Cache** after deployment
4. **Test in Incognito Mode** to verify functionality

## 🎉 **Success Indicators**

Your deployment is successful when:
- ✅ Model selection shows Gemini as default and working
- ✅ Resume analysis completes without errors
- ✅ LinkedIn analysis dropdown appears (with data or fallback)
- ✅ GitHub analysis dropdown appears (with data or fallback)
- ✅ No timeout errors in Vercel logs
- ✅ All links are clickable and functional

## 📞 **Support**

If issues persist:
1. Check Vercel function logs
2. Verify API key quotas/billing
3. Test locally: `npm run dev`
4. Check browser console for errors

---

**Your JobHatch platform is now ready for production deployment on Vercel! 🚀**