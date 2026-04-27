import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { sendChatMessage, type ChatMessage } from '../services/chat';

const MAX_HISTORY = 8;
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      "Hi! I'm ParkSmart Assistant. Ask me about parking search, bookings, payments, or anything else in the app.",
  },
];
marked.setOptions({ breaks: true });

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  useEffect(() => {
    const reset = () => { setMessages(INITIAL_MESSAGES); setIsOpen(false); };
    window.addEventListener('user-logout', reset);
    return () => window.removeEventListener('user-logout', reset);
  }, []);

  const trimmedHistory = useMemo(() => messages.slice(-MAX_HISTORY), [messages]);

  const renderMessage = useMemo(
    () => (content: string) => ({
      __html: DOMPurify.sanitize(marked.parse(content) as string),
    }),
    [],
  );

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(text, trimmedHistory);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again in a moment.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I couldn't answer that. ${fallback}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 sm:w-96 max-h-[70vh] rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div>
              <p className="text-sm font-semibold">ParkSmart Assistant</p>
              <p className="text-xs text-slate-300">Ask anything about parking & bookings</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-white/80 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`chatbot-markdown max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                  dangerouslySetInnerHTML={renderMessage(msg.content)}
                >
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 text-sm bg-white border border-slate-200 text-slate-500">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question"
                className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/30"
              />
              <button
                onClick={() => void handleSend()}
                disabled={isLoading}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
      >
        {isOpen ? 'Hide chat' : 'Chat with us'}
      </button>
    </div>
  );
}
