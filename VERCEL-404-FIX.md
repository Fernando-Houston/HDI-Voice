# Fixing Vercel 404 Error

## Issue
Your Vercel deployment shows a 404 error at: https://hdi-voice-hbcyjzom0-houston-land-guy-s-projects.vercel.app/

## Root Causes and Solutions

### 1. Environment Variables
You need to set these in Vercel Dashboard → Settings → Environment Variables:
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `NEXT_PUBLIC_HDI_API_URL`: https://hdi-api-production.up.railway.app
- `NEXT_PUBLIC_ELEVENLABS_VOICE_ID`: Z3R5wn05IrDiVCyEkUrK

### 2. Framework Configuration
In Vercel Dashboard → Settings → General → Build & Development Settings:
- Framework Preset: **Next.js** (not "Other")
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 3. vercel.json Configuration
I've created a `vercel.json` file with the correct settings:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

### 4. Redeployment Steps

#### Option A: Through Vercel Dashboard
1. Go to your project on vercel.com
2. Click on the Settings tab
3. Update all the settings mentioned above
4. Go to the Deployments tab
5. Click "Redeploy" on the latest deployment
6. Select "Use existing Build Cache" and click "Redeploy"

#### Option B: Through CLI (if connected)
```bash
# If you have Vercel CLI set up:
vercel --prod
```

### 5. If Still Getting 404

1. **Clear Build Cache**: In Vercel Dashboard → Settings → Advanced → Delete Build Cache
2. **Check Logs**: In Vercel Dashboard → Functions tab → Check for errors
3. **Verify Files**: Ensure these files exist:
   - `/pages/index.js`
   - `/pages/api/elevenlabs-tts.js`
   - `/HDI-Voice-Enhanced.jsx`

### 6. Alternative Solutions

If the main domain still shows 404:
1. Try accessing the deployment directly via the preview URL
2. Create a new Vercel project and import from GitHub
3. Deploy under an individual account instead of team account

### Common Issues
- Preview deployments work but production doesn't → Clear cache and redeploy
- API routes return 404 → Check environment variables
- Everything returns 404 → Framework preset is likely set to "Other" instead of "Next.js"

### Testing After Fix
Once deployed, test:
1. Main page loads: `https://your-domain.vercel.app/`
2. API endpoint works: `https://your-domain.vercel.app/api/elevenlabs-tts` (should return 405 for GET request)
3. Voice features work with proper API keys