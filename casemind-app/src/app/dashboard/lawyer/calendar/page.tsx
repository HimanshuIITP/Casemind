"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Briefcase,
  AlertCircle
} from "lucide-react";

interface Hearing {
  id: string;
  case_id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  court: string;
  judge: string;
  notes?: string;
}

export default function LawyerCalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHearings() {
      setIsLoading(true);
      try {
        const res = await axiosClient.get("/hearings?size=100");
        setHearings(res.data.items || []);
      } catch (error) {
        console.error("Failed to fetch hearings", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHearings();
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => setSelectedDate(day);

  // Render Calendar Header
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#111111]">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  // Render Days of Week
  const renderDays = () => {
    const dateFormat = "EEEE";
    const days = [];
    let startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-bold text-xs text-gray-400 uppercase tracking-wider py-3">
          {format(addDays(startDate, i), dateFormat).substring(0, 3)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-[#E5E7EB] bg-gray-50/50 rounded-t-2xl">{days}</div>;
  };

  // Render Calendar Cells
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        // Find hearings for this day
        const dayHearings = hearings.filter(h => isSameDay(parseISO(h.date), cloneDay));
        
        days.push(
          <div
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            className={`min-h-[100px] border-b border-r border-[#E5E7EB] p-2 transition-all cursor-pointer relative group ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-50/50 text-gray-400"
                : isSameDay(day, selectedDate)
                ? "bg-[#C9971A]/5 ring-1 ring-inset ring-[#C9971A]"
                : "bg-white hover:bg-gray-50 text-gray-800"
            } ${i === 6 ? "border-r-0" : ""}`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                isSameDay(day, new Date()) ? "bg-[#111111] text-white" : ""
              }`}>
                {formattedDate}
              </span>
            </div>
            
            <div className="mt-2 flex flex-col gap-1">
              {dayHearings.slice(0, 3).map((h, idx) => (
                <div 
                  key={idx} 
                  className="px-2 py-1 text-[10px] font-bold rounded bg-[#111111] text-white truncate"
                >
                  {h.time} - {h.type}
                </div>
              ))}
              {dayHearings.length > 3 && (
                <div className="text-[10px] text-gray-500 font-medium pl-1">
                  +{dayHearings.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-[#E5E7EB]">{rows}</div>;
  };

  // Selected Day Agenda
  const selectedDayHearings = hearings.filter(h => isSameDay(parseISO(h.date), selectedDate))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-12">
      
      {/* LEFT: Calendar Grid */}
      <div className="flex-1 bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-sm">
        {renderHeader()}
        <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
          {renderDays()}
          {renderCells()}
        </div>
      </div>

      {/* RIGHT: Daily Agenda */}
      <div className="w-full lg:w-96 space-y-6">
        
        {/* Daily Summary Card */}
        <div className="bg-[#111111] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9971A]/20 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Daily Agenda</h3>
            <h2 className="text-2xl font-bold mb-4">{format(selectedDate, "EEEE, MMMM d")}</h2>
            
            <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-3xl font-bold text-[#C9971A]">{selectedDayHearings.length}</p>
                <p className="text-xs font-medium text-gray-400">Events Scheduled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm p-6 min-h-[400px]">
          <h3 className="font-bold text-[#111111] mb-6 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#C9971A]" /> Schedule
          </h3>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#C9971A] rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Loading schedule...</p>
            </div>
          ) : selectedDayHearings.length > 0 ? (
            <div className="space-y-4">
              {selectedDayHearings.map(hearing => (
                <div 
                  key={hearing.id}
                  onClick={() => router.push(`/dashboard/lawyer/cases/${hearing.case_id}`)}
                  className="group p-4 border border-[#E5E7EB] rounded-2xl hover:border-[#C9971A] hover:shadow-md transition-all cursor-pointer bg-gray-50 hover:bg-white relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#111111] group-hover:bg-[#C9971A] transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-[#111111]">{hearing.type}</h4>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      hearing.status === 'Scheduled' ? 'bg-[#C9971A]/10 text-[#C9971A]' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {hearing.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{hearing.time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{hearing.court}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="truncate">Case ID: {hearing.case_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-700">No Events Scheduled</h4>
              <p className="text-sm text-gray-500 mt-1">Enjoy your free time or schedule a new meeting.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
