import React from 'react';

interface CenteredLoaderProps {
  message?: string;
  minHeightClass?: string; // override default height wrapper
  small?: boolean; // smaller spinner variant
}

const CenteredLoader: React.FC<CenteredLoaderProps> = ({
  message = 'Loading...',
  minHeightClass = 'min-h-[65vh]',
  small = false,
}) => {
  const sizeClasses = small ? 'w-8 h-8 border-3' : 'w-12 h-12 border-4';
  return (
    <div className={`w-full ${minHeightClass} flex flex-col items-center justify-center`}>
      <div className={`${sizeClasses} border-gray-300 border-t-slate-900 rounded-full animate-spin mb-5`} />
      <p className="text-sm text-slate-600 tracking-wide">{message}</p>
    </div>
  );
};

export default CenteredLoader;
