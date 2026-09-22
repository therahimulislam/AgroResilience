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

  const handleVoiceQuery = async (query: string) => {
    if (!farmId) return;
    setLoading(true);
    try {
      const data = await sendVoiceQuery(farmId, query, selectedLang.code);
      setAiResponse(data.answer);
      speakResponse(data.answer);
    } catch {
      setError('Could not reach the AI service. Please try again.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
            <Radio className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Voice Assistant</p>
            <p className="text-xs text-gray-400">Speak to ask about your farm</p>
          </div>
        </div>
        {/* Language Selector */}
        <select
          value={selectedLang.code}
          onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">

        {/* Mic Button */}
        <div className="relative">
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
          )}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 scale-110'
                : 'bg-primary hover:bg-primary-dark'
            } disabled:opacity-50`}
          >
            {isListening
              ? <MicOff className="w-10 h-10 text-white" />
              : <Mic className="w-10 h-10 text-white" />
            }
          </button>
        </div>

        <p className="text-sm text-gray-500 font-medium">
          {isListening ? 'Listening... tap to stop' : 'Tap to speak'}
        </p>

        {/* Transcript */}
        {transcript && (
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">You said</p>
            <p className="text-sm text-gray-800 italic">"{transcript}"</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Getting AI response...</span>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && !loading && (
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">AgroResilience AI</p>
              <button
                onClick={() => speakResponse(aiResponse)}
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${speaking ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-primary'}`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {speaking ? 'Speaking...' : 'Replay'}
              </button>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{aiResponse}</p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
