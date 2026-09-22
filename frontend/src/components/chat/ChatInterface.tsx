import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sendChatMessage, type ChatMessage } from '../../services/chat';
import { Bot, User, Send, Loader2, Leaf } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Why is my risk score high?",
  "Should I irrigate today?",
  "What does my NDVI score mean?",
  "Is it safe to apply fertilizer now?",
];

export default function ChatInterface() {
  const { farmId } = useParams<{ farmId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (question: string) => {
    if (!question.trim() || !farmId) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessage(farmId, question, messages);
      const aiMessage: ChatMessage = { role: 'model', content: data.answer };
      setMessages([...newHistory, aiMessage]);
    } catch {
      const errMessage: ChatMessage = {
        role: 'model',
        content: 'I could not connect to the AI service. Please check your network and try again.',
      };
      setMessages([...newHistory, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">AgroResilience AI</p>
          <p className="text-xs text-gray-400">Grounded in your farm's live data</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center pt-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Ask about your farm</p>
              <p className="text-sm text-gray-400 mt-1">I have access to your satellite, weather, soil and risk data.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left text-sm bg-white border border-gray-200 text-gray-600 rounded-xl px-4 py-3 hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask about your farm..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
