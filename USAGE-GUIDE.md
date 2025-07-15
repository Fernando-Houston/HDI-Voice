# Houston Voice AI - Usage Guide

## 🚀 Quick Start

### 1. **Setup Environment Variables**
```bash
# Copy the example file
cp .env.local.example .env.local

# Your .env.local should contain:
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=Z3R5wn05IrDiVCyEkUrK
NEXT_PUBLIC_HDI_API_URL=https://hdi-api-production.up.railway.app
```

### 2. **Use the Enhanced Component**
Replace your current component with the enhanced version:
```javascript
import HoustonVoiceAI from './HDI-Voice-Enhanced';

function App() {
  return <HoustonVoiceAI />;
}
```

### 3. **Setup ElevenLabs API Route** (Next.js)
Place the API route file in your pages/api directory:
```bash
mkdir -p pages/api
cp api-elevenlabs-tts.js pages/api/elevenlabs-tts.js
```

## 🎯 Key Improvements

### ✅ Fixed Search Issues
- **30-second timeout** prevents indefinite hanging
- **Automatic retry** with exponential backoff (1s, 2s, 4s)
- **Request cancellation** when starting new searches
- **Detailed error messages** for better debugging

### ✅ ElevenLabs Integration
- **Server-side API calls** keep your key secure
- **Fallback to browser TTS** if ElevenLabs fails
- **Audio playback controls** (play/pause/stop)
- **Your specific voice ID** already configured

### ✅ Enhanced Error Handling
- **Visual error alerts** with clear messages
- **Graceful degradation** when services fail
- **Debug logging** for troubleshooting

## 🎤 Voice Commands

### Property Searches
- "Find 924 Zoe Street"
- "What's the value of 1247 Main Street?"
- "Show me properties in Katy"
- "Search for 3 bedroom homes in The Woodlands"

### Market Analysis
- "What's the Houston real estate market like?"
- "Tell me about Energy Corridor"
- "Compare Sugar Land to Katy"
- "Investment opportunities in Houston"

### Follow-up Questions
- "What about the schools?"
- "Tell me more about the neighborhood"
- "Is it a good investment?"
- "What's the crime rate there?"

## 🛠️ Testing & Debugging

### 1. **Test API Connection**
Open browser console and run:
```javascript
// Load and run tests
import('./test-api-endpoints.js').then(m => m.runAllTests())
```

### 2. **Enable Debug Mode**
Add to your component:
```javascript
import { enableAPIDebugMode } from './api-utils';

useEffect(() => {
  enableAPIDebugMode(); // Enables detailed logging
}, []);
```

### 3. **Monitor Network Activity**
- Open DevTools → Network tab
- Filter by "hdi-api" or "elevenlabs"
- Check response times and status codes

## 📱 Browser Compatibility

### Supported Browsers
- ✅ Chrome (recommended)
- ✅ Safari
- ✅ Edge
- ⚠️ Firefox (limited voice recognition)

### Mobile Support
- ✅ iOS Safari
- ✅ Android Chrome
- 📱 Responsive design included

## ⚡ Performance Tips

### 1. **Optimize Search Queries**
```javascript
// Be specific to reduce search time
"924 Zoe Street Houston" // Better
"Zoe Street" // Slower (too broad)
```

### 2. **Use Quick Commands**
Pre-configured commands execute faster:
- Click quick command buttons
- Reduces typing and recognition errors

### 3. **Manage Conversation History**
- Component keeps last 3 exchanges for context
- Clear history with Reset button if needed

## 🔧 Customization

### Voice Personalities
Select from 4 pre-configured voices:
- Professional (formal expert)
- Friendly (casual local)
- Analytical (data-focused)
- Texas Native (authentic accent)

### API Configuration
Adjust timeouts and retries in `api-utils.js`:
```javascript
const API_CONFIG = {
  REQUEST_TIMEOUT: 30000, // Increase for slow connections
  MAX_RETRIES: 3,        // Reduce for faster failures
  RETRY_DELAY: 1000      // Increase for gentler retries
};
```

## 🚨 Common Issues

### "Voice recognition not supported"
- Use Chrome or Safari
- Allow microphone permissions
- Check HTTPS connection

### "Request timeout" errors
- Flask API may be slow/cold starting
- Try again in a few seconds
- Check TROUBLESHOOTING.md

### "Voice generation failed"
- Check ElevenLabs API key
- Verify monthly character limit
- Falls back to browser TTS

## 📊 Usage Analytics

Track performance in console:
```javascript
// After enabling debug mode
window.HDI_API_DEBUG.logs // View all API calls
window.HDI_API_DEBUG.testConnection() // Test connectivity
```

## 🎉 Ready to Go!

1. Start your Next.js dev server
2. Open the app in Chrome
3. Click the microphone button
4. Ask about Houston real estate!

Need help? Check TROUBLESHOOTING.md for detailed solutions.