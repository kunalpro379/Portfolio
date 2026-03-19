import LoadingAnimation from './LoadingAnimation';

export default function PageShimmer() {
  return (
    <div className="min-h-screen bg-[#E6F4FF] flex items-center justify-center">
      <div className="flex items-center justify-center py-8">
        <LoadingAnimation className="w-28 h-28" />
      </div>
    </div>
  );
}


