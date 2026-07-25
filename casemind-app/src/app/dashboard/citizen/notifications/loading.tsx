export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-[#E5E7EB]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16 mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
