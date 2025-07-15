# Houston Voice AI - Enhanced with Search Fix & ElevenLabs

A voice-powered real estate AI assistant for Houston properties with 1.7M+ property database access.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd HDI-Vocie
   ```

2. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys (already included in example)
   ```

3. **Install dependencies** (if using in Next.js project)
   ```bash
   npm install
   ```

4. **Use the enhanced component**
   ```javascript
   import HoustonVoiceAI from './HDI-Voice-Enhanced';
   ```

5. **Add API route** (for Next.js)
   ```bash
   cp api-elevenlabs-tts.js pages/api/elevenlabs-tts.js
   ```

## 🎯 Key Features

- ✅ **Fixed search hanging issue** - 30-second timeout with retry logic
- ✅ **ElevenLabs integration** - Professional voice output
- ✅ **Request cancellation** - Prevents overlapping searches
- ✅ **Enhanced error handling** - Clear error messages
- ✅ **Debug mode** - Detailed API logging
- ✅ **Voice recognition** - Browser-native Web Speech API

## 📁 File Structure

- `HDI-Voice-Enhanced.tsx` - Main enhanced component with fixes
- `api-utils.js` - API utilities with timeout/retry logic
- `api-elevenlabs-tts.js` - Next.js API route for ElevenLabs
- `test-api-endpoints.js` - Test script for debugging
- `USAGE-GUIDE.md` - Detailed usage instructions
- `TROUBLESHOOTING.md` - Common issues and solutions

## 🧪 Testing

Run the test script in browser console:
```javascript
import('./test-api-endpoints.js').then(m => m.runAllTests())
```

## 🔧 Configuration

Your ElevenLabs credentials:
- API Key: `sk_bd5f7cafdababd4ba8a2d2f03bee04a9327c564831b342e3`
- Voice ID: `Z3R5wn05IrDiVCyEkUrK`

## 📖 Documentation

- [Usage Guide](./USAGE-GUIDE.md) - How to use the voice AI
- [Troubleshooting](./TROUBLESHOOTING.md) - Fix common issues
- [Build Guide](./houston-voice-ai-build-guide.md) - Original implementation guide

## 🚨 Important Notes

1. The search hanging issue was caused by lack of timeout handling
2. Flask API on Railway may have cold start delays
3. First request after idle may take longer
4. All API calls now have 30-second timeout with 3 retries

## 💡 Next Steps

1. Test the implementation
2. Monitor API response times
3. Consider backend optimizations if searches still slow
4. Add caching for common queries

---

Built to fix text search hanging issues and integrate professional voice output via ElevenLabs.