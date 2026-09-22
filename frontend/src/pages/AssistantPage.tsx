import { useState } from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import VoiceInterface from '../components/voice/VoiceInterface';
import { MessageSquare, Mic } from 'lucide-react';

export default function AssistantPage() {
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Farm AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Powered by Google Gemini — grounded in your farm's live intelligence.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 self-start">
        <button
          onClick={() => setMode('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'chat' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare className="w-4 h-4" />
          Text Chat
        </button>
        <button
          onClick={() => setMode('voice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'voice' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Mic className="w-4 h-4" />
          Voice
        </button>
      </div>

      {/* Interface */}
      <div className="flex-1 min-h-[500px]">
        {mode === 'chat' ? <ChatInterface /> : <VoiceInterface />}
      </div>
    </div>
  );
}
