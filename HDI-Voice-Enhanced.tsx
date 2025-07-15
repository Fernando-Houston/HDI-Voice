import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Building, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Bot,
  Waves,
  Radio,
  Headphones,
  Phone,
  MessageCircle,
  Zap,
  Star,
  Clock,
  Users,
  Target,
  Sparkles,
  Brain,
  Settings,
  Info,
  AlertCircle
} from 'lucide-react';

// Configuration
const API_CONFIG = {
  HDI_BASE_URL: process.env.NEXT_PUBLIC_HDI_API_URL || 'https://hdi-api-production.up.railway.app',
  ELEVENLABS_VOICE_ID: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'Z3R5wn05IrDiVCyEkUrK',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000 // 1 second
};

const HoustonVoiceAI = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [selectedVoice, setSelectedVoice] = useState('professional');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const voiceVisualizerRef = useRef(null);
  const [audioWaveform, setAudioWaveform] = useState(Array(20).fill(0));
  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Simulate voice level animation
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setVoiceLevel(Math.random() * 100);
        setAudioWaveform(Array(20).fill(0).map(() => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVoiceLevel(0);
      setAudioWaveform(Array(20).fill(0));
    }
  }, [isListening]);

  // Simulate AI speaking animation
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setAudioWaveform(Array(20).fill(0).map(() => Math.random() * 80 + 20));
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const voicePersonalities = [
    { id: 'professional', name: 'Professional', description: 'Formal real estate expert', icon: Building },
    { id: 'friendly', name: 'Friendly', description: 'Casual Houston local', icon: Users },
    { id: 'analytical', name: 'Analytical', description: 'Data-driven insights', icon: TrendingUp },
    { id: 'texan', name: 'Texas Native', description: 'Authentic Houston accent', icon: Star }
  ];

  const quickCommands = [
    { command: "Find nine twenty four Zoe Street", category: "Property Search", icon: Building },
    { command: "What's the best family neighborhood?", category: "Lifestyle", icon: Users },
    { command: "Show me investment properties in Katy", category: "Investment", icon: DollarSign },
    { command: "Tell me about The Woodlands schools", category: "Education", icon: Target },
    { command: "Search recent Houston flood maps", category: "Research", icon: MapPin },
    { command: "Compare Energy Corridor to Sugar Land", category: "Analysis", icon: TrendingUp }
  ];

  const recentConversations = [
    { id: 1, query: "Property lookup: 1247 Main Street", duration: "2:34", time: "10 min ago" },
    { id: 2, query: "Investment analysis: Katy area", duration: "1:45", time: "1 hour ago" },
    { id: 3, query: "Market trends: Energy Corridor", duration: "3:12", time: "2 hours ago" },
    { id: 4, query: "Rental yields: Woodlands properties", duration: "2:08", time: "3 hours ago" }
  ];

  // Enhanced fetch with timeout and retry logic
  const fetchWithTimeout = async (url, options = {}, retries = API_CONFIG.MAX_RETRIES) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    const fetchOptions = {
      ...options,
      signal: abortControllerRef.current.signal
    };

    for (let i = 0; i < retries; i++) {
      try {
        const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), API_CONFIG.REQUEST_TIMEOUT);
        
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - the server took too long to respond');
        }
        
        if (i === retries - 1) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * Math.pow(2, i)));
      }
    }
  };

  // ElevenLabs TTS integration using secure API route
  const speakWithElevenLabs = async (text) => {
    try {
      setIsSpeaking(true);
      
      const response = await fetchWithTimeout('/api/elevenlabs-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voiceId: API_CONFIG.ELEVENLABS_VOICE_ID,
          modelId: 'eleven_monolingual_v1',
          voiceSettings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        setError('Failed to play audio response');
      };
      
      await audio.play();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
      
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      } else {
        setError('Voice output is not available');
      }
    }
  };

  // Web Speech API integration with mobile support
  const startVoiceRecognition = () => {
    // Check for both webkit and standard SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in your browser. Please use Chrome or Safari.');
      return;
    }

    setError('');
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
      setCurrentQuery('');
    };
    
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentQuery(transcript);
      
      if (event.results[event.results.length - 1].isFinal) {
        processVoiceQuery(transcript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      switch(event.error) {
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          setError('Microphone access denied.');
          break;
        case 'not-allowed':
          setError('Please allow microphone access to use voice features.');
          break;
        default:
          setError('Voice recognition error. Please try again.');
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const processVoiceQuery = async (query) => {
    setIsListening(false);
    setIsProcessing(true);
    setError('');
    
    try {
      let response = '';
      
      // Check if this is a property-specific query
      if (isPropertyQuery(query)) {
        const propertyData = await voiceSearchProperty(query);
        if (propertyData && propertyData.length > 0) {
          const formattedData = await getVoiceFormattedProperty(propertyData[0].id);
          response = formattedData.voice_summary || formattedData.summary || 'Property found but no voice summary available.';
        } else {
          response = await askAIWithContext(query);
        }
      } else {
        // Use AI chat for general questions
        response = await askAIWithContext(query);
      }
      
      setAiResponse(response);
      setConversationHistory(prev => [...prev, { query, response, timestamp: new Date() }]);
      
      // Speak the response
      await speakWithElevenLabs(response);
      
    } catch (error) {
      console.error('Voice query error:', error);
      const errorResponse = error.message || "I apologize, but I'm having trouble accessing the Houston property database right now. Please try again in a moment.";
      setAiResponse(errorResponse);
      setError(errorResponse);
      await speakWithElevenLabs(errorResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if query is property-specific
  const isPropertyQuery = (query) => {
    const propertyKeywords = [
      'property', 'house', 'home', 'address', 'street', 'avenue', 'road', 'drive',
      'value', 'worth', 'price', 'cost', 'owner', 'sq ft', 'square feet',
      'year built', 'built in', 'tax', 'rent', 'rental'
    ];
    
    const hasAddress = /\d+\s+\w+/i.test(query);
    const hasPropertyKeyword = propertyKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    return hasAddress || hasPropertyKeyword;
  };

  // Voice-optimized property search with enhanced error handling
  const voiceSearchProperty = async (spokenText) => {
    const response = await fetchWithTimeout(`${API_CONFIG.HDI_BASE_URL}/api/v1/properties/voice-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spoken_text: spokenText
      })
    });
    
    return await response.json();
  };

  // Get voice-formatted property data
  const getVoiceFormattedProperty = async (propertyId) => {
    const response = await fetchWithTimeout(`${API_CONFIG.HDI_BASE_URL}/api/v1/properties/voice-format/${propertyId}`);
    return await response.json();
  };

  // Ask AI with conversation context
  const askAIWithContext = async (question) => {
    const context = {
      question: question,
      search_web: true,
      context: {
        conversation_history: conversationHistory.slice(-3).map(conv => 
          `User: ${conv.query}\nAI: ${conv.response}`
        ).join('\n\n')
      }
    };

    const response = await fetchWithTimeout(`${API_CONFIG.HDI_BASE_URL}/api/v1/properties/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context)
    });
    
    const data = await response.json();
    return data.response || data.answer || 'No response received from AI.';
  };

  const playResponse = () => {
    if (aiResponse) {
      speakWithElevenLabs(aiResponse);
    }
  };

  const reset = () => {
    setCurrentQuery('');
    setAiResponse('');
    setIsListening(false);
    setIsSpeaking(false);
    setError('');
    setIsProcessing(false);
    stopVoiceRecognition();
    stopSpeaking();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Radio className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Houston Voice AI
                </h1>
                <p className="text-sm text-gray-400">Your Personal Real Estate Intelligence Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                connectionStatus === 'connected' 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' 
                  : 'bg-red-500/20 border-red-500/30 text-red-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className="text-sm font-medium">
                  {connectionStatus === 'connected' ? 'AI Online' : 'Connecting...'}
                </span>
              </div>
              <button className="p-3 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Voice Interface */}
        <div className="text-center mb-12">
          {/* Voice Visualizer */}
          <div className="relative mb-8">
            <div className="w-80 h-80 mx-auto relative">
              {/* Outer Ring */}
              <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                isListening ? 'border-purple-400 shadow-2xl shadow-purple-500/30' :
                isSpeaking ? 'border-cyan-400 shadow-2xl shadow-cyan-500/30' :
                isProcessing ? 'border-yellow-400 shadow-2xl shadow-yellow-500/30' :
                'border-gray-600'
              }`}>
                {/* Pulsing effect */}
                {(isListening || isSpeaking || isProcessing) && (
                  <div className={`absolute inset-0 rounded-full animate-ping ${
                    isListening ? 'bg-purple-500/20' : 
                    isSpeaking ? 'bg-cyan-500/20' :
                    'bg-yellow-500/20'
                  }`}></div>
                )}
              </div>
              
              {/* Voice Level Ring */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="relative">
                  {/* Central Icon */}
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl shadow-purple-500/50' :
                    isSpeaking ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-xl shadow-cyan-500/50' :
                    isProcessing ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-xl shadow-yellow-500/50' :
                    'bg-gradient-to-r from-gray-700 to-gray-800'
                  }`}>
                    {isListening ? (
                      <Mic className="w-10 h-10 text-white animate-pulse" />
                    ) : isSpeaking ? (
                      <Volume2 className="w-10 h-10 text-white animate-pulse" />
                    ) : isProcessing ? (
                      <Brain className="w-10 h-10 text-white animate-spin" />
                    ) : (
                      <Bot className="w-10 h-10 text-white" />
                    )}
                  </div>
                  
                  {/* Voice Waveform */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-end space-x-1">
                    {audioWaveform.map((height, index) => (
                      <div
                        key={index}
                        className={`w-2 transition-all duration-100 rounded-full ${
                          isListening ? 'bg-purple-400' : 
                          isSpeaking ? 'bg-cyan-400' : 
                          isProcessing ? 'bg-yellow-400' :
                          'bg-gray-600'
                        }`}
                        style={{ height: `${Math.max(height / 3, 8)}px` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="mb-8">
            {isListening ? (
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-purple-400">Listening...</h2>
                <p className="text-gray-400">Ask me anything about Houston real estate</p>
                {conversationHistory.length > 0 && (
                  <p className="text-sm text-cyan-400">💬 Context: {conversationHistory.length} previous questions</p>
                )}
                {currentQuery && (
                  <p className="text-white bg-gray-800/50 rounded-lg p-3 max-w-md mx-auto">
                    "{currentQuery}"
                  </p>
                )}
              </div>
            ) : isSpeaking ? (
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-cyan-400">Speaking...</h2>
                <p className="text-gray-400">AI is providing Houston market insights</p>
                {conversationHistory.length > 0 && (
                  <p className="text-sm text-cyan-400">💬 Using conversation context</p>
                )}
              </div>
            ) : isProcessing ? (
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-yellow-400">Processing...</h2>
                <p className="text-gray-400">Searching Houston property database</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Ready to Help</h2>
                <p className="text-gray-400">Tap the mic to ask about Houston real estate</p>
                {conversationHistory.length > 0 && (
                  <p className="text-sm text-emerald-400">💬 {conversationHistory.length} questions in context</p>
                )}
              </div>
            )}
          </div>

          {/* Voice Controls */}
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
              disabled={isSpeaking || isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 shadow-lg shadow-red-500/50 hover:bg-red-600' 
                  : (isSpeaking || isProcessing)
                  ? 'bg-gray-600 shadow-lg shadow-gray-600/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30 hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>

            {aiResponse && (
              <button
                onClick={isSpeaking ? stopSpeaking : playResponse}
                disabled={isProcessing}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 flex items-center justify-center transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl transform hover:scale-105"
              >
                {isSpeaking ? (
                  <VolumeX className="w-8 h-8 text-white" />
                ) : (
                  <Volume2 className="w-8 h-8 text-white" />
                )}
              </button>
            )}

            <button
              onClick={reset}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RotateCcw className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

        {/* Current Response */}
        {aiResponse && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Response</h3>
              <span className="text-sm text-gray-400">• Just now</span>
            </div>
            <p className="text-gray-200 leading-relaxed">{aiResponse}</p>
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-800/50">
              <button
                onClick={playResponse}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Follow Up</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Quick Commands</span>
            </h3>
            <div className="space-y-3">
              {quickCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuery(cmd.command);
                    processVoiceQuery(cmd.command);
                  }}
                  disabled={isProcessing || isListening || isSpeaking}
                  className="w-full text-left p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-all border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <cmd.icon className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{cmd.command}</p>
                      <p className="text-sm text-gray-400">{cmd.category}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Recent Conversations</span>
            </h3>
            <div className="space-y-3">
              {recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{conv.query}</p>
                      <p className="text-sm text-gray-400">{conv.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{conv.duration}</span>
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Voice Personality Selector */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Headphones className="w-5 h-5 text-emerald-400" />
            <span>Voice Personality</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {voicePersonalities.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedVoice === voice.id
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                    : 'border-gray-700/50 hover:border-gray-600/50 bg-gray-800/30'
                }`}
              >
                <voice.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h4 className="font-medium text-white text-sm">{voice.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{voice.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoustonVoiceAI;