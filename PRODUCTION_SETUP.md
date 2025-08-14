# Production Setup Guide

## 🚀 How to Start the Production Version

### Prerequisites
Make sure you have the required environment variables in `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step-by-Step Production Deployment

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Build the Production Version
```bash
npm run build
```
This command:
- Compiles TypeScript to JavaScript
- Optimizes the React components
- Generates static pages where possible
- Creates an optimized production build in `.next/` directory

#### 3. Start the Production Server
```bash
npm start
```
This will start the production server on `http://localhost:3000`

### Alternative Commands

#### Development Mode (for testing)
```bash
npm run dev
```
- Runs on `http://localhost:3000` (or 3001 if 3000 is busy)
- Hot reloading enabled
- Source maps for debugging

#### Type Checking Only
```bash
npm run type-check
```

#### Linting Only
```bash
npm run lint
```

### Production Server Features

When running in production mode:
- ✅ **Optimized Performance**: Minified and compressed assets
- ✅ **Better Caching**: Static assets cached efficiently
- ✅ **SSR Ready**: Server-side rendering for faster initial load
- ✅ **API Routes**: All backend APIs available at `/api/*`
- ✅ **Environment Variables**: Loads from `.env.local`

### Expected Output

When the build is successful, you should see:
```
Route (app)                               Size     First Load JS
┌ ○ /                                     76.8 kB         177 kB
└ ○ /_not-found                           875 B            88 kB

Route (pages)                             Size     First Load JS
┌ ƒ /api/analyze-resume                   0 B            80.7 kB
├ ƒ /api/github-analyzer                  0 B            80.7 kB
├ ƒ /api/linkedin-analyzer                0 B            80.7 kB
└ ... (other API routes)
```

### Troubleshooting

#### Build Fails
- Check for TypeScript errors: `npm run type-check`
- Check for linting errors: `npm run lint`
- Ensure all dependencies are installed: `npm install`

#### Production Server Won't Start
- Ensure build completed successfully: `npm run build`
- Check if port 3000 is available
- Verify environment variables are set in `.env.local`

#### API Routes Not Working
- Check API key configuration in `.env.local`
- Verify file upload limits in deployment environment
- Check server logs for specific API errors

### Deployment to Production Hosting

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Other Hosting
1. Run `npm run build`
2. Upload the entire project directory
3. Run `npm start` on the server
4. Ensure environment variables are configured

### Performance Monitoring

The production build includes:
- **Bundle Analysis**: Check `Size` column in build output
- **First Load JS**: Initial JavaScript payload
- **Static Optimization**: Pages marked with ○ are pre-rendered
- **Dynamic Routes**: API routes marked with ƒ are server-rendered

### Security Notes

- Never commit `.env.local` to version control
- API keys should be set in production environment
- File upload size limits are configured in the API routes
- CORS is handled automatically by Next.js

---

## 🎯 Current Status: ✅ Ready for Production

The platform integration has been fully optimized:
- GitHub analysis integrated with OpenAI
- LinkedIn analysis integrated with OpenAI  
- Clean, compact UI with dropdowns
- No unused files or duplicate components
- TypeScript errors resolved
- Build optimization complete
