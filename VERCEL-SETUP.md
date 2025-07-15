# Vercel Deployment Setup

## Environment Variables for Vercel

Add these in your Vercel Dashboard → Project Settings → Environment Variables:

### Required Variables:

```bash
# Server-side only (keeps your API key secure)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Client-side (safe to expose)
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=Z3R5wn05IrDiVCyEkUrK
NEXT_PUBLIC_HDI_API_URL=https://hdi-api-production.up.railway.app
```

⚠️ **IMPORTANT**: 
- Do NOT add `NEXT_PUBLIC_` to your ELEVENLABS_API_KEY
- The API key stays server-side only for security

## Mobile Voice Support

✅ **Voice recognition works on mobile:**
- iOS Safari (iPhone/iPad)
- Android Chrome
- Requires HTTPS (Vercel provides this)
- User must grant microphone permission

### Mobile-specific features implemented:
1. Cross-browser compatibility (`SpeechRecognition` or `webkitSpeechRecognition`)
2. Clear error messages for permission issues
3. Touch-friendly UI with large buttons
4. Visual feedback during listening

## Deployment Steps

1. **Connect GitHub repo to Vercel:**
   ```
   https://github.com/Fernando-Houston/HDI-Voice
   ```

2. **Set environment variables** (as shown above)

3. **Deploy** - Vercel will automatically:
   - Install dependencies
   - Build the project
   - Deploy to HTTPS domain

4. **Test on mobile:**
   - Open on phone browser
   - Tap microphone button
   - Allow microphone access
   - Speak your query

## Testing Voice Commands

### Desktop:
- Chrome/Safari recommended
- Click microphone icon
- Speak clearly

### Mobile:
- Tap microphone icon
- Grant permission when prompted
- Hold phone 6-12 inches from mouth
- Speak in quiet environment

## Troubleshooting Mobile

If voice doesn't work on mobile:
1. Check HTTPS (required for microphone)
2. Clear browser cache/permissions
3. Try Chrome (Android) or Safari (iOS)
4. Ensure microphone not used by other apps

## Security Notes

Your deployment is secure because:
- ElevenLabs API key is server-side only
- API route handles the key securely
- HTTPS required for voice recognition
- No sensitive data in client code