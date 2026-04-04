export default function LoadingDashboard() {
  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <Skeleton className="h-10 w-96 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
         <Skeleton className="h-[120px]" />
         <Skeleton className="h-[120px]" />
         <Skeleton className="h-[120px]" />
         <Skeleton className="h-[120px]" />
         <Skeleton className="h-[120px]" />
      </div>
      <div className="w-full">
        <Skeleton className="h-[460px] w-full" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton className="w-full lg:w-[60%] h-[400px]" />
        <Skeleton className="w-full lg:w-[40%] h-[400px]" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton className="w-full lg:w-1/2 h-[400px]" />
        <Skeleton className="w-full lg:w-1/2 h-[400px]" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton className="w-full lg:w-1/2 h-[400px]" />
        <Skeleton className="w-full lg:w-1/2 h-[400px]" />
      </div>
    </div>
  );
}
