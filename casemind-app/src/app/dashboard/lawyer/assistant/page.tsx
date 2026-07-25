"use client";

import { useState, useEffect, useRef } from "react";
import axiosClient from "@/lib/axiosClient";
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Bot, 
  User, 
  Briefcase, 
  ChevronDown,
  Loader2,
  AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Case {
  case_id: string;
  title: string;
}

export default function LawyerAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations and cases on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [convRes, casesRes] = await Promise.all([
          axiosClient.get("/ai/conversations"),
          axiosClient.get("/lawyer/cases?size=50") // get up to 50 active cases for dropdown
        ]);
        setConversations(convRes.data.conversations || []);
        setCases(casesRes.data.items || []);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    }
    loadInitialData();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const payload: any = {
        prompt: userMsg,
      };
      if (activeConversation) payload.conversation_id = activeConversation;
      if (selectedCase) payload.case_id = selectedCase;

      const res = await axiosClient.post("/ai/chat", payload);
      
      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
      
      if (!activeConversation) {
        setActiveConversation(res.data.conversation_id);
        // refresh conversations to get the newly created one
        const convRes = await axiosClient.get("/ai/conversations");
        setConversations(convRes.data.conversations || []);
      }
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error connecting to the AI services. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
    setSelectedCase("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-7xl mx-auto border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-sm animate-in fade-in duration-500">
      
      {/* LEFT SIDEBAR: History */}
      <div className="w-80 bg-gray-50 border-r border-[#E5E7EB] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[#E5E7EB]">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase ml-2 mb-2 mt-2">Recent Chats</p>
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConversation(conv.id);
                setMessages([]); // We'd ideally fetch chat history here, but we can reset for now or fetch by ID if endpoint existed
              }}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                activeConversation === conv.id ? "bg-white shadow-sm border border-[#E5E7EB]" : "hover:bg-gray-200/50 border border-transparent"
              }`}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${activeConversation === conv.id ? "text-[#C9971A]" : "text-gray-400"}`} />
              <div className="truncate">
                <p className={`text-sm font-semibold truncate ${activeConversation === conv.id ? "text-[#111111]" : "text-gray-700"}`}>
                  {conv.title}
                </p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No history yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Chat Window */}
      <div className="flex-1 flex flex-col bg-white relative">
        
        {/* Header - Case Selection */}
        <div className="h-16 border-b border-[#E5E7EB] flex items-center px-6 justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9971A]/10 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#C9971A]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111111]">Legal AI Assistant</h2>
              <p className="text-xs text-gray-500 font-medium">Powered by Mistral</p>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowCaseDropdown(!showCaseDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white"
            >
              <Briefcase className="w-4 h-4 text-gray-400" />
              {selectedCase ? cases.find(c => c.case_id === selectedCase)?.title || selectedCase : "Attach Case Context"}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showCaseDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden z-20">
                <div className="max-h-60 overflow-y-auto p-1">
                  <button 
                    onClick={() => { setSelectedCase(""); setShowCaseDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    No Case Context
                  </button>
                  {cases.map(c => (
                    <button 
                      key={c.case_id}
                      onClick={() => { setSelectedCase(c.case_id); setShowCaseDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-[#111111] hover:bg-gray-50 rounded-lg font-bold"
                    >
                      <div className="truncate">{c.title}</div>
                      <div className="text-xs text-gray-400 font-medium">{c.case_id}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center space-y-8">
              <div className="w-16 h-16 bg-[#C9971A]/10 rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-[#C9971A]/20">
                <Bot className="w-8 h-8 text-[#C9971A]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#111111] mb-2">How can I assist you today?</h3>
                <p className="text-gray-500">I can draft documents, analyze case history, or provide general legal research. Select a case above for targeted answers.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {[
                  "Draft a notice for breach of contract.",
                  "Summarize the recent orders in this case.",
                  "Find legal precedents for unfair dismissal.",
                  "What is the status of the attached case?"
                ].map((prompt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-4 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-700 hover:border-[#C9971A] hover:bg-white transition-all text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-[#C9971A] text-white shadow-sm" : "bg-gray-200 text-gray-600"
                  }`}>
                    {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === "assistant" 
                      ? "bg-gray-50 border border-[#E5E7EB] text-gray-800" 
                      : "bg-[#111111] text-white shadow-md"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#C9971A] text-white shadow-sm flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-50 border border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white">
          <div className="max-w-4xl mx-auto relative flex items-end bg-gray-50 border border-[#E5E7EB] rounded-2xl focus-within:border-[#C9971A] focus-within:ring-1 focus-within:ring-[#C9971A] transition-all shadow-sm">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedCase ? "Ask anything about the attached case..." : "Ask a legal question or request research..."}
              className="w-full max-h-48 min-h-[56px] py-4 pl-4 pr-12 bg-transparent resize-none focus:outline-none text-sm"
              rows={1}
            />
            <button 
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 bottom-2 p-2 bg-[#111111] text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">AI can make mistakes. Consider verifying important legal information.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
