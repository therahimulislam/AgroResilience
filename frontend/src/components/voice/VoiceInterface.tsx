import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sendVoiceQuery } from '../../services/chat';
import { Mic, MicOff, Volume2, Loader2, Radio } from 'lucide-react';

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

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input is not supported in your browser. Please use Chrome.');
      return;
    }

    setError('');
    setTranscript('');
    setAiResponse('');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = selectedLang.srLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const interim = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(interim);
    };

    recognition.onend = async () => {
      setIsListening(false);
      const finalTranscript = recognitionRef.current?._finalTranscript || transcript;
      if (finalTranscript.trim() && farmId) {
        await handleVoiceQuery(finalTranscript);
      }
    };

    recognition.onspeechend = () => {
      recognitionRef.current._finalTranscript = transcript;
      recognition.stop();
    };

    recognition.onerror = (e: any) => {
      setError(`Voice error: ${e.error}`);
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleVoiceQuery = (query: string) => {
    if (!farmId) return;
    setLoading(true);
    setAiResponse('');
    setError('');

    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    let wsUrl = baseUrl.replace(/^http/, 'ws') + `/farms/${farmId}/voice/stream`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setLoading(false);
      setSpeaking(true); // Treat streaming phase as speaking visually
      ws.send(JSON.stringify({ transcript: query, language: selectedLang.code }));
    };

    let fullResponse = '';

    ws.onmessage = (event) => {
      if (event.data === '[DONE]') {
        ws.close();
        speakResponse(fullResponse);
      } else {
        fullResponse += event.data;
        setAiResponse(fullResponse);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection error.');
      setLoading(false);
      setSpeaking(false);
    };
    
    ws.onclose = () => {
      setLoading(false);
      if (!fullResponse) setSpeaking(false);
    };
  };

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = selectedLang.srLang;
    utter.rate = 0.9;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  // Determine the orb style based on state
  let orbClass = "w-32 h-32 md:w-48 md:h-48 transition-all duration-700 ease-in-out flex items-center justify-center cursor-pointer ";
  let orbContainerClass = "relative flex items-center justify-center animate-float ";
  
  if (loading) {
    // Loading state: glowing blue blob rotating
    orbClass += "bg-gradient-to-tr from-blue-500 via-indigo-400 to-purple-500 scale-100 shadow-[0_0_60px_rgba(99,102,241,0.5)] animate-morph animate-spin-slow";
  } else if (isListening) {
    // Listening state: dynamic red/pink glowing morphing blob
    orbClass += "bg-gradient-to-tr from-rose-500 via-pink-500 to-orange-400 scale-110 shadow-[0_0_80px_rgba(244,63,94,0.7)] animate-morph";
  } else if (speaking) {
    // Speaking state: teal/emerald/cyan breathing blob
    orbClass += "bg-gradient-to-tr from-teal-400 via-emerald-400 to-cyan-500 scale-105 shadow-[0_0_70px_rgba(16,185,129,0.6)] animate-morph animate-pulse";
  } else {
    // Idle state: subtle dark fluid blob
    orbClass += "bg-gradient-to-tr from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 hover:scale-105 shadow-[0_0_40px_rgba(0,0,0,0.2)] animate-morph";
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] bg-[#f9fafb] rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Radio className="w-4 h-4 text-gray-600" />
          </div>
          <span className="font-semibold text-gray-700">Voice Assistant</span>
        </div>
        
        <select
          value={selectedLang.code}
          onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
          className="text-sm border-0 bg-white/80 backdrop-blur shadow-sm rounded-full px-4 py-2 outline-none cursor-pointer text-gray-700 font-medium hover:bg-white transition-colors"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-6">
        
        {/* Dynamic Orb */}
        <div className={orbContainerClass} onClick={loading || speaking ? undefined : (isListening ? stopListening : startListening)}>
          {/* Ripples when listening */}
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
          <p className="text-gray-400 font-medium tracking-wide">
            {loading ? 'Thinking...' : isListening ? 'Listening...' : speaking ? 'Speaking...' : 'Tap to start speaking'}
          </p>
        </div>

        {/* Transcripts */}
        {(transcript || aiResponse) && (
          <div className="absolute bottom-8 left-0 right-0 px-8 max-w-2xl mx-auto w-full">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-5 overflow-hidden transition-all">
              {transcript && !aiResponse && (
                <p className="text-gray-800 text-lg md:text-xl font-medium text-center animate-pulse">"{transcript}"</p>
              )}
              {aiResponse && (
                <div className="text-center">
                  <p className="text-gray-800 font-medium text-sm md:text-base leading-relaxed line-clamp-3">{aiResponse}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm whitespace-nowrap z-50">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
