"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Scale } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am CaseMind AI, your intelligent legal assistant. How can I help you today? You can ask me to explain legal terms, understand court procedures, or clarify your case status."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI immediately
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const result = await apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          prompt: userMessage,
          conversation_id: conversationId
        })
      });

      if (!conversationId) setConversationId(result.conversation_id);

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: result.response 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `Error: ${err.message || "Failed to connect to AI service."}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9971A]/10 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-[#C9971A]" />
          </div>
          <div>
            <h1 className="font-bold text-[#111111]">CaseMind Legal AI</h1>
            <p className="text-xs text-gray-500 font-medium">Powered by Hugging Face</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              msg.role === 'user' ? 'bg-[#111111] text-white' : 'bg-[#C9971A] text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-[#111111] text-white rounded-tr-sm' 
                : 'bg-gray-100 text-[#111111] rounded-tl-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 flex-row">
            <div className="w-8 h-8 rounded-full bg-[#C9971A] text-white flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1 items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#E5E7EB]">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about court procedures, legal terms..."
            className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-[#C9971A] focus:ring-1 focus:ring-[#C9971A] transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-[#111111] text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
          CaseMind AI can make mistakes. Consider verifying important legal information.
        </p>
      </div>
    </div>
  );
}
