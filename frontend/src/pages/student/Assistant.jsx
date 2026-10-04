import { useState } from 'react';
import api from '../../api/client';

const SUGGESTIONS = [
  'What is my GPA?',
  "What classes do I have tomorrow?",
  'Which subjects am I failing?',
  'What is my attendance?',
  'Do I have outstanding fees?',
];

export default function Assistant() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am your Smart Academic Assistant 🤖. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (q) => {
    const question = q || input.trim();
    if (!question) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/student/assistant/ask', { question });
      setMessages((m) => [...m, { role: 'bot', text: data.answer }]);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🤖 Smart Academic Assistant</h1>
      <div className="card h-[500px] flex flex-col">
        <div className="flex-1 overflow-auto space-y-3 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl whitespace-pre-line ${
                m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
              }`}>{m.text}</div>
            </div>
          ))}
          {loading && <div className="text-slate-400 text-sm">Thinking...</div>}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full">
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <input className="input flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." />
          <button className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}