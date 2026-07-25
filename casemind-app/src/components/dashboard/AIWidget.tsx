"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowRight, Loader2, User } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export default function AIWidget({ caseId }: { caseId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Summarize Case CM-1021",
    "Explain IPC 420",
    "Find contradictions in evidence",
    "Prepare hearing notes",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const newMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: newMsgId, role: "user", content: text }]);
    setInputText("");
    setLoading(true);

    try {
      const payload: any = { prompt: text };
      if (conversationId) payload.conversation_id = conversationId;
      if (caseId) payload.case_id = caseId;

      const res = await axiosClient.post("/ai/chat", payload);
      
      if (res.data.conversation_id) {
        setConversationId(res.data.conversation_id);
      }

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "ai", 
        content: res.data.response 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "ai", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm shadow-gray-200/50 flex flex-col h-[500px]">
      <div className="px-6 py-5 border-b border-[#E5E7EB] bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#C9971A]" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#111111]">Ask CaseMind</h3>
            <p className="text-xs text-gray-500 font-medium">AI Legal Assistant</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden relative">
        {messages.length === 0 ? (
          <div className="space-y-3 overflow-y-auto hide-scrollbar flex-1 pb-4">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Suggestions</p>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="w-full text-left px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-gray-600 hover:border-[#C9971A]/50 hover:bg-[#C9971A]/5 hover:text-[#111111] transition-all duration-200 group flex justify-between items-center"
              >
                <span>{suggestion}</span>
                <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[#C9971A] transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 px-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#111111] text-white' : 'bg-[#C9971A]/10 text-[#C9971A]'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-[#111111] text-white rounded-tr-none' : 'bg-gray-100 text-[#111111] rounded-tl-none'}`}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-[#111111]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C9971A]/10 text-[#C9971A] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="relative mt-auto flex-shrink-0 px-2 pb-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            placeholder="How can I help you today?"
            disabled={loading}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all placeholder:text-gray-400 shadow-inner disabled:opacity-50"
          />
          <button 
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#111111] hover:bg-gray-800 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
