"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import { 
  Search, 
  Briefcase, 
  ChevronDown,
  Loader2,
  BookOpen,
  Clock,
  Bookmark,
  Download,
  AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Case {
  case_id: string;
  title: string;
}

interface ResearchHistory {
  id: string;
  query: string;
  case_id?: string;
  result: string;
  timestamp: string;
  saved: boolean;
}

export default function LegalResearchPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const [history, setHistory] = useState<ResearchHistory[]>([]);

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await axiosClient.get("/lawyer/cases?size=50");
        setCases(res.data.items || []);
      } catch (err) {
        console.error("Failed to fetch cases", err);
      }
    }
    loadCases();

    // Load history from local storage
    const localHistory = localStorage.getItem("casemind_research_history");
    if (localHistory) {
      setHistory(JSON.parse(localHistory));
    }
  }, []);

  const saveHistoryToLocal = (newHistory: ResearchHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem("casemind_research_history", JSON.stringify(newHistory));
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setIsLoading(true);
    setResult(null);

    try {
      const payload: any = { query: searchQuery };
      if (selectedCase) payload.case_id = selectedCase;

      const res = await axiosClient.post("/ai/legal-research", payload);
      
      const newEntry: ResearchHistory = {
        id: Date.now().toString(),
        query: searchQuery,
        case_id: selectedCase,
        result: res.data.research_results,
        timestamp: new Date().toISOString(),
        saved: false
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
      saveHistoryToLocal(updatedHistory);
      setResult(res.data.research_results);

    } catch (err) {
      console.error("Research error", err);
      setResult("### Error\nFailed to perform legal research. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSave = (id: string) => {
    const updated = history.map(h => h.id === id ? { ...h, saved: !h.saved } : h);
    saveHistoryToLocal(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    }
  };

  const exportMarkdown = () => {
    if (!result) return;
    const blob = new Blob([`# Legal Research: ${query}\n\n${result}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Legal_Research_${query.replace(/\\s+/g, '_').substring(0, 20)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const suggestions = [
    "Precedents for corporate fraud liability in multi-national entities.",
    "Statute of limitations for breach of contract in civil courts.",
    "Guidelines for calculating damages in intellectual property infringement.",
    "Conditions for granting an emergency injunction."
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header & Search Area */}
      <div className="bg-gradient-to-br from-[#111111] to-gray-900 rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9971A]/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <BookOpen className="w-12 h-12 text-[#C9971A] mx-auto mb-2" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">AI Legal Research</h1>
          <p className="text-gray-400 font-medium">Search millions of case laws, statutes, and precedents instantly.</p>
          
          <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-xl focus-within:ring-2 focus-within:ring-[#C9971A] transition-all">
            
            {/* Case Context Dropdown */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setShowCaseDropdown(!showCaseDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors h-full"
              >
                <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="hidden md:inline max-w-[120px] truncate">
                  {selectedCase ? cases.find(c => c.case_id === selectedCase)?.title || selectedCase : "Attach Case"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </button>

              {showCaseDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-white border border-[#E5E7EB] rounded-xl shadow-2xl overflow-hidden z-20 text-left">
                  <div className="max-h-60 overflow-y-auto p-1">
                    <button 
                      onClick={() => { setSelectedCase(""); setShowCaseDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                    >
                      General Research (No Context)
                    </button>
                    {cases.map(c => (
                      <button 
                        key={c.case_id}
                        onClick={() => { setSelectedCase(c.case_id); setShowCaseDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-[#111111] hover:bg-gray-50 rounded-lg font-bold border-t border-gray-100"
                      >
                        <div className="truncate">{c.title}</div>
                        <div className="text-xs text-gray-400 font-medium">{c.case_id}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2"></div>
            
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g., Precedents for unfair dismissal..."
              className="flex-1 bg-transparent border-none py-3 px-4 focus:outline-none text-gray-800 font-medium placeholder-gray-400"
            />
            
            <button 
              onClick={() => handleSearch(query)}
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-[#111111] text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!result && !isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Query Suggestions */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" /> Query Suggestions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setQuery(sug); handleSearch(sug); }}
                  className="p-4 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-700 hover:border-[#C9971A] hover:shadow-sm transition-all text-left flex items-start gap-3"
                >
                  <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-3 h-3 text-gray-400" />
                  </div>
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Saved & Recent History */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5">
              <h3 className="text-[#111111] font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#C9971A]" /> Saved Research
              </h3>
              <div className="space-y-3">
                {history.filter(h => h.saved).slice(0, 3).map(h => (
                  <button 
                    key={h.id}
                    onClick={() => { setQuery(h.query); setResult(h.result); }}
                    className="w-full text-left flex items-start gap-3 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9971A] mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-[#111111] line-clamp-2">{h.query}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(h.timestamp).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
                {history.filter(h => h.saved).length === 0 && (
                  <p className="text-sm text-gray-500">No saved research.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5">
              <h3 className="text-[#111111] font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Recent Searches
              </h3>
              <div className="space-y-3">
                {history.filter(h => !h.saved).slice(0, 4).map(h => (
                  <button 
                    key={h.id}
                    onClick={() => { setQuery(h.query); setResult(h.result); }}
                    className="w-full text-left text-sm font-medium text-gray-600 hover:text-[#111111] truncate"
                  >
                    {h.query}
                  </button>
                ))}
                 {history.filter(h => !h.saved).length === 0 && (
                  <p className="text-sm text-gray-500">No recent searches.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          {/* Results Toolbar */}
          <div className="p-4 border-b border-[#E5E7EB] bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#C9971A]" />
              <h2 className="text-sm font-bold text-[#111111]">Research Results</h2>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const currentHistory = history[0];
                  if(currentHistory && currentHistory.query === query) {
                    toggleSave(currentHistory.id);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
                  history[0]?.query === query && history[0]?.saved 
                    ? "bg-[#C9971A]/10 text-[#C9971A] border-[#C9971A]/20" 
                    : "bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50"
                }`}
              >
                <Bookmark className="w-4 h-4" /> 
                {history[0]?.query === query && history[0]?.saved ? "Saved" : "Save"}
              </button>
              
              <button 
                onClick={exportMarkdown}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* Results Content */}
          <div className="p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#C9971A] animate-spin mb-4" />
                <p className="font-bold text-[#111111]">Analyzing Legal Repositories...</p>
                <p className="text-sm text-gray-500 mt-1">Extracting case laws and statutory references.</p>
              </div>
            ) : result ? (
              <div className="prose prose-sm max-w-none 
                prose-headings:font-bold prose-headings:text-[#111111] 
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:pb-2 prose-h3:border-b prose-h3:border-gray-100
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-li:text-gray-700
                prose-strong:text-[#111111]
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
