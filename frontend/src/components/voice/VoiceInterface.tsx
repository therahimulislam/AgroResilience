import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, MicOff, Volume2, Loader2, Radio } from 'lucide-react';
import { api } from '../../services/api';

const LANGUAGES = [
  { code: 'en', label: 'English', srLang: 'en-IN' },
  { code: 'hi', label: 'हिंदी', srLang: 'hi-IN' },
  { code: 'as', label: 'অসমীয়া', srLang: 'as-IN' },
  { code: 'bn', label: 'বাংলা', srLang: 'bn-IN' },
];

export default function VoiceInterface() {
  const { farmId } = useParams<{ farmId: string }>();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Warm up speech synthesis voices on mount
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      recognitionRef.current?.stop();
      wsRef.current?.close();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    // Clean markdown characters and error/note tags so TTS speaks naturally
    const cleanText = text
      .replace(/\[Error:.*?\]/gi, '')
      .replace(/\[Note:.*?\]/gi, '')
      .replace(/[*#_`~>\[\]]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = selectedLang.srLang;
    utter.rate = 0.95;

    // Pick best available language voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.replace('_', '-') === selectedLang.srLang || v.lang.startsWith(selectedLang.code)
    );
    if (matchedVoice) {
      utter.voice = matchedVoice;
    }

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  const handleVoiceQuery = async (query: string) => {
    if (!farmId || !query) return;
    setLoading(true);
    setAiResponse('');
    setError('');

    // Ensure API URL has /api/v1 properly formatted
    let base = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
    if (!base.endsWith('/api/v1')) {
      base += '/api/v1';
    }
    const wsUrl = base.replace(/^http/, 'ws') + `/farms/${farmId}/voice/stream`;

    let receivedAnyMessage = false;
    let fullResponse = '';

    // Fallback to HTTP POST if WebSocket connection fails or times out
    const fallbackToHttp = async () => {
      try {
        setLoading(true);
        const res = await api.post(`/farms/${farmId}/voice`, {
          transcript: query,
          language: selectedLang.code,
        });
        setLoading(false);
        const answer = res.data?.answer || '';
        if (answer) {
          setAiResponse(answer);
          speakResponse(answer);
        } else {
          setError('No response received from assistant.');
        }
      } catch (err: any) {
        setLoading(false);
        setError(err.response?.data?.detail || err.message || 'Voice service error');
      }
    };

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (!receivedAnyMessage) {
          try { ws.close(); } catch {}
          fallbackToHttp();
        }
      }, 4000);

      ws.onopen = () => {
        ws.send(JSON.stringify({ transcript: query, language: selectedLang.code }));
      };

      ws.onmessage = (event) => {
        receivedAnyMessage = true;
        clearTimeout(connectionTimeout);
        setLoading(false);

        if (event.data === '[DONE]') {
          ws.close();
          speakResponse(fullResponse);
        } else {
          fullResponse += event.data;
          setAiResponse(fullResponse);
        }
      };

      ws.onerror = () => {
        clearTimeout(connectionTimeout);
        if (!receivedAnyMessage) {
          fallbackToHttp();
        }
      };

      ws.onclose = () => {
        clearTimeout(connectionTimeout);
        setLoading(false);
        if (!receivedAnyMessage && !fullResponse) {
          fallbackToHttp();
        } else if (fullResponse) {
          speakResponse(fullResponse);
        }
      };
    } catch {
      fallbackToHttp();
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Please use Google Chrome.');
      return;
    }

    // Stop ongoing speech & socket
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    wsRef.current?.close();

    setError('');
    setTranscript('');
    transcriptRef.current = '';
    setAiResponse('');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = selectedLang.srLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      transcriptRef.current = text;
      setTranscript(text);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = async () => {
      setIsListening(false);
      const query = transcriptRef.current.trim();
      if (query && farmId) {
        await handleVoiceQuery(query);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        setError(`Voice error: ${e.error}`);
      }
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (err: any) {
      setError(`Microphone error: ${err.message}`);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleOrbClick = () => {
    if (loading) return;
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Orb dynamic class styles
  let orbClass = "w-32 h-32 md:w-48 md:h-48 transition-all duration-700 ease-in-out flex items-center justify-center cursor-pointer ";
  let orbContainerClass = "relative flex items-center justify-center animate-float ";
  
  if (loading) {
    orbClass += "bg-gradient-to-tr from-blue-500 via-indigo-400 to-purple-500 scale-100 shadow-[0_0_60px_rgba(99,102,241,0.5)] animate-morph animate-spin-slow";
  } else if (isListening) {
    orbClass += "bg-gradient-to-tr from-rose-500 via-pink-500 to-orange-400 scale-110 shadow-[0_0_80px_rgba(244,63,94,0.7)] animate-morph";
  } else if (speaking) {
    orbClass += "bg-gradient-to-tr from-teal-400 via-emerald-400 to-cyan-500 scale-105 shadow-[0_0_70px_rgba(16,185,129,0.6)] animate-morph animate-pulse";
  } else {
    orbClass += "bg-gradient-to-tr from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 hover:scale-105 shadow-[0_0_40px_rgba(0,0,0,0.2)] animate-morph";
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] bg-[#f9fafb] rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <span className="font-semibold text-gray-800">Voice Assistant</span>
        </div>
        
        <select
          value={selectedLang.code}
          onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
          className="text-sm border-0 bg-white/90 backdrop-blur shadow-sm rounded-full px-4 py-2 outline-none cursor-pointer text-gray-700 font-medium hover:bg-white transition-colors"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-6">
        
        {/* Dynamic Orb */}
        <div className={orbContainerClass} onClick={handleOrbClick}>
          {isListening && (
            <>
              <div className="absolute w-40 h-40 md:w-60 md:h-60 rounded-full bg-rose-400/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-48 h-48 md:w-72 md:h-72 rounded-full bg-rose-400/10 animate-ping" style={{ animationDuration: '3s' }} />
            </>
          )}
          
          <div className={orbClass}>
            {loading ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : isListening ? (
              <MicOff className="w-12 h-12 text-white/90" />
            ) : speaking ? (
              <Volume2 className="w-12 h-12 text-white/90 animate-bounce" />
            ) : (
              <Mic className="w-12 h-12 text-white/90" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="absolute bottom-24 left-0 right-0 text-center px-8">
          <p className="text-gray-500 font-medium tracking-wide text-sm md:text-base">
            {loading
              ? 'Analyzing farm telemetry...'
              : isListening
              ? 'Listening... Tap orb when finished'
              : speaking
              ? 'Speaking... Tap orb to mute'
              : 'Tap orb to start speaking'}
          </p>
        </div>

        {/* Transcripts Card */}
        {(transcript || aiResponse) && (
          <div className="absolute bottom-6 left-0 right-0 px-6 max-w-2xl mx-auto w-full z-20">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 max-h-44 overflow-y-auto transition-all">
              {transcript && (
                <div className="mb-2 pb-2 border-b border-gray-100">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">You:</span>
                  <p className="text-gray-800 text-sm font-medium">"{transcript}"</p>
                </div>
              )}
              {aiResponse && (
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Assistant:</span>
                  <p className="text-gray-800 text-sm font-medium leading-relaxed">{aiResponse}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs md:text-sm font-medium shadow-sm whitespace-nowrap z-50">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

