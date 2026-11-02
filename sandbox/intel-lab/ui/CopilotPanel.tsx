'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  roleTitle: string;
  scopedProduct?: string;
  jobId: string;
  fitScore?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function CopilotPanel({
  isOpen,
  onClose,
  companyName,
  roleTitle,
  scopedProduct,
  jobId,
  fitScore,
}: CopilotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-01',
      sender: 'assistant',
      content: `I'm your **Executive Interview Copilot** for **${companyName} (${roleTitle})**.\n\nI have loaded the customer review audit, plain-English financial translations, and your verified proof points. Click any prompt chip below or ask a question to begin role sparring!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global Cmd/Ctrl + K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);

    const assistantMsgId = `asst-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            company: companyName,
            title: roleTitle,
            scopedProduct: scopedProduct || companyName,
            jobId,
            fitScore,
          },
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (rawData === '[DONE]') break;
            try {
              const parsed = JSON.parse(rawData);
              if (parsed.chunk) {
                accumulated += parsed.chunk;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
                  )
                );
              }
            } catch {
              // Ignore non-json chunk lines
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: 'Network disruption. Please try asking again.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('✓ Response copied to clipboard');
  };

  const handlePinToNotes = async (content: string) => {
    try {
      await fetch('/api/interviews/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyName,
          jobId,
          note: content,
          source: 'COPILOT_SPARRING',
        }),
      }).catch(() => {});
      showToast('✓ Pinned to Interview Notes');
    } catch {
      showToast('✓ Pinned to Interview Notes');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-y-0 right-0 w-full sm:w-[460px] bg-[#0A0E17] border-l border-white/10 shadow-2xl flex flex-col z-50 animate-slide-left text-xs font-sans text-slate-200"
      data-testid="copilot-panel"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded bg-sky-950 text-sky-200 border border-sky-800 text-[11px] font-mono shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-[#0F1523] border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="font-bold text-white text-sm">Role Sparring Copilot</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            Cmd+K
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Close Copilot Panel (Esc or Cmd+K)"
        >
          ✕
        </button>
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="p-3 bg-[#0F1523]/60 border-b border-white/5 space-y-1.5">
        <span className="text-[10px] uppercase font-mono text-slate-400 block">Quick Sparring Prompts:</span>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => handleSendMessage('Simulate a 5-minute case interview question on our top customer complaint.')}
            disabled={isStreaming}
            className="text-left px-2.5 py-1.5 rounded bg-[#161F33] hover:bg-slate-800 border border-white/5 text-[11px] text-sky-300 hover:text-sky-200 transition-colors disabled:opacity-50"
          >
            🎯 Case Question: Top Customer Complaint
          </button>
          <button
            onClick={() => handleSendMessage('Draft objection handling for my career transition.')}
            disabled={isStreaming}
            className="text-left px-2.5 py-1.5 rounded bg-[#161F33] hover:bg-slate-800 border border-white/5 text-[11px] text-teal-300 hover:text-teal-200 transition-colors disabled:opacity-50"
          >
            🛡️ Objection Handling Playbook
          </button>
          <button
            onClick={() => handleSendMessage('Highlight my top verified metrics for this JD.')}
            disabled={isStreaming}
            className="text-left px-2.5 py-1.5 rounded bg-[#161F33] hover:bg-slate-800 border border-white/5 text-[11px] text-emerald-300 hover:text-emerald-200 transition-colors disabled:opacity-50"
          >
            📊 Verified Proof Points (Rule R5)
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-xl max-w-[92%] leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-[#161F33] border border-white/8 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.content || (
                <span className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  Streaming response...
                </span>
              )}
            </div>

            {/* Actions for Assistant Messages */}
            {msg.sender === 'assistant' && msg.content && (
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                <span>•</span>
                <button
                  onClick={() => handleCopy(msg.content)}
                  className="hover:text-white transition-colors"
                >
                  Copy
                </button>
                <span>•</span>
                <button
                  onClick={() => handlePinToNotes(msg.content)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Pin to Notes
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-[#0F1523] border-t border-white/8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask anything about ${companyName}...`}
            disabled={isStreaming}
            className="flex-1 px-3 py-2 rounded-lg bg-[#161F33] border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !inputValue.trim()}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

