export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mt-8">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-[#E5E7EB] last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
