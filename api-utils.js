// API Utility Functions with Enhanced Error Handling

export const API_CONFIG = {
  HDI_BASE_URL: process.env.NEXT_PUBLIC_HDI_API_URL || 'https://hdi-api-production.up.railway.app',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  EXPONENTIAL_BACKOFF: true
};

// Enhanced fetch with timeout, retry, and detailed error logging
export async function fetchWithEnhancedHandling(url, options = {}, config = {}) {
  const {
    timeout = API_CONFIG.REQUEST_TIMEOUT,
    maxRetries = API_CONFIG.MAX_RETRIES,
    retryDelay = API_CONFIG.RETRY_DELAY,
    exponentialBackoff = API_CONFIG.EXPONENTIAL_BACKOFF,
    onRetry = null
  } = config;

  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`API Request (Attempt ${attempt + 1}/${maxRetries}):`, {
        url,
        method: options.method || 'GET',
        headers: options.headers,
        bodyPreview: options.body ? JSON.stringify(JSON.parse(options.body)).substring(0, 100) + '...' : undefined
      });

      const startTime = Date.now();
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      const responseTime = Date.now() - startTime;

      clearTimeout(timeoutId);

      console.log(`API Response:`, {
        url,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error Response Body:`, errorBody);
        
        // Don't retry on client errors (4xx), only on server errors (5xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error ${response.status}: ${errorBody || response.statusText}`);
        }
        
        throw new Error(`Server error ${response.status}: ${errorBody || response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      console.error(`API Request Failed (Attempt ${attempt + 1}/${maxRetries}):`, {
        url,
        error: error.message,
        type: error.name
      });

      // Don't retry on abort errors (timeout) or client errors
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms - the server took too long to respond`);
      }

      if (error.message.includes('Client error')) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Calculate retry delay
      const delay = exponentialBackoff 
        ? retryDelay * Math.pow(2, attempt) 
        : retryDelay;

      console.log(`Retrying in ${delay}ms...`);
      
      if (onRetry) {
        onRetry(attempt + 1, delay, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Unknown error occurred');
}

// HDI API specific functions with enhanced error handling
export const HDI_API = {
  // Voice-optimized property search
  async voiceSearchProperty(spokenText, options = {}) {
    console.log('Voice Search Request:', { spokenText });
    
    try {
      const response = await fetchWithEnhancedHandling(
        `${API_CONFIG.HDI_BASE_URL}/api/v1/properties/voice-search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spoken_text: spokenText,
            ...options
          })
        }
      );

      const data = await response.json();
      console.log('Voice Search Response:', {
        resultCount: Array.isArray(data) ? data.length : 'N/A',
        hasResults: !!data && (Array.isArray(data) ? data.length > 0 : true)
      });

      return data;
    } catch (error) {
      console.error('Voice Search Error:', error);
      throw new Error(`Property search failed: ${error.message}`);
    }
  },

  // Get voice-formatted property data
  async getVoiceFormattedProperty(propertyId) {
    console.log('Voice Format Request:', { propertyId });
    
    try {
      const response = await fetchWithEnhancedHandling(
        `${API_CONFIG.HDI_BASE_URL}/api/v1/properties/voice-format/${propertyId}`
      );

      const data = await response.json();
      console.log('Voice Format Response:', {
        hasVoiceSummary: !!data.voice_summary,
        hasSummary: !!data.summary
      });

      return data;
    } catch (error) {
      console.error('Voice Format Error:', error);
      throw new Error(`Property formatting failed: ${error.message}`);
    }
  },

  // Ask AI with conversation context
  async askAIWithContext(question, conversationHistory = [], options = {}) {
    console.log('AI Ask Request:', { 
      question, 
      historyLength: conversationHistory.length,
      searchWeb: options.search_web !== false
    });

    const context = {
      question: question,
      search_web: options.search_web !== false,
      context: {
        conversation_history: conversationHistory.slice(-3).map(conv => 
          `User: ${conv.query}\nAI: ${conv.response}`
        ).join('\n\n'),
        ...options.context
      }
    };

    try {
      const response = await fetchWithEnhancedHandling(
        `${API_CONFIG.HDI_BASE_URL}/api/v1/properties/ask`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(context)
        },
        {
          // Longer timeout for AI responses
          timeout: 60000, // 60 seconds
          onRetry: (attempt, delay, error) => {
            console.log(`AI request retry ${attempt}, waiting ${delay}ms due to: ${error.message}`);
          }
        }
      );

      const data = await response.json();
      console.log('AI Ask Response:', {
        hasResponse: !!data.response,
        hasAnswer: !!data.answer,
        responseLength: (data.response || data.answer || '').length
      });

      return data;
    } catch (error) {
      console.error('AI Ask Error:', error);
      throw new Error(`AI query failed: ${error.message}`);
    }
  },

  // Test API connectivity
  async testConnection() {
    console.log('Testing HDI API connection...');
    
    try {
      const response = await fetchWithEnhancedHandling(
        `${API_CONFIG.HDI_BASE_URL}/api/v1/health`,
        {},
        {
          timeout: 10000, // 10 seconds for health check
          maxRetries: 1
        }
      );

      if (response.ok) {
        console.log('HDI API connection successful');
        return true;
      }
    } catch (error) {
      console.error('HDI API connection failed:', error);
    }

    // Try a simple endpoint as fallback
    try {
      const response = await fetchWithEnhancedHandling(
        `${API_CONFIG.HDI_BASE_URL}/api/v1/properties/ask`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'test', search_web: false })
        },
        {
          timeout: 10000,
          maxRetries: 1
        }
      );

      console.log('HDI API connection successful (via ask endpoint)');
      return response.ok;
    } catch (error) {
      console.error('HDI API connection test failed completely:', error);
      return false;
    }
  }
};

// ElevenLabs specific functions
export const ElevenLabs = {
  // Text to speech using API route
  async textToSpeech(text, options = {}) {
    const {
      voiceId = 'Z3R5wn05IrDiVCyEkUrK',
      modelId = 'eleven_monolingual_v1',
      voiceSettings = {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
      }
    } = options;

    console.log('ElevenLabs TTS Request:', {
      textLength: text.length,
      voiceId,
      modelId
    });

    try {
      const response = await fetchWithEnhancedHandling(
        '/api/elevenlabs-tts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voiceId,
            modelId,
            voiceSettings
          })
        },
        {
          timeout: 30000, // 30 seconds for audio generation
          maxRetries: 2
        }
      );

      const audioBlob = await response.blob();
      console.log('ElevenLabs TTS Success:', {
        audioSize: audioBlob.size,
        audioType: audioBlob.type
      });

      return audioBlob;
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw new Error(`Voice generation failed: ${error.message}`);
    }
  }
};

// Helper function to detect property queries
export function isPropertyQuery(query) {
  const propertyKeywords = [
    'property', 'house', 'home', 'address', 'street', 'avenue', 'road', 'drive',
    'value', 'worth', 'price', 'cost', 'owner', 'sq ft', 'square feet',
    'year built', 'built in', 'tax', 'rent', 'rental', 'bedroom', 'bathroom',
    'garage', 'lot size', 'pool', 'school district', 'neighborhood'
  ];
  
  const queryLower = query.toLowerCase();
  
  // Check for address pattern (number followed by text)
  const hasAddress = /\d+\s+\w+/i.test(query);
  
  // Check for property keywords
  const hasPropertyKeyword = propertyKeywords.some(keyword => 
    queryLower.includes(keyword)
  );
  
  // Check for Houston-specific locations
  const houstonLocations = [
    'houston', 'katy', 'sugar land', 'woodlands', 'cypress', 'pearland',
    'energy corridor', 'memorial', 'river oaks', 'heights', 'montrose'
  ];
  
  const hasLocation = houstonLocations.some(location => 
    queryLower.includes(location)
  );
  
  return hasAddress || (hasPropertyKeyword && hasLocation) || hasPropertyKeyword;
}

// Debug helper for development
export function enableAPIDebugMode() {
  if (typeof window !== 'undefined') {
    window.HDI_API_DEBUG = {
      API_CONFIG,
      HDI_API,
      ElevenLabs,
      logs: [],
      clearLogs: () => window.HDI_API_DEBUG.logs = [],
      testConnection: HDI_API.testConnection
    };
    
    console.log('API Debug Mode Enabled. Access via window.HDI_API_DEBUG');
  }
}

export default {
  API_CONFIG,
  fetchWithEnhancedHandling,
  HDI_API,
  ElevenLabs,
  isPropertyQuery,
  enableAPIDebugMode
};