export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mt-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-6 pb-6 border-b border-[#E5E7EB] last:border-0">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
