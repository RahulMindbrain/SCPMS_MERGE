import React from "react";

interface LoaderProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false, size = "md", text }) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-3",
    lg: "h-16 w-16 border-4",
  };

  const containerClasses = fullScreen
    ? "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-xl transition-all duration-300"
    : `flex flex-col items-center justify-center ${size === 'sm' ? 'p-2' : 'p-8'} w-full h-full ${size === 'sm' ? '' : 'min-h-[400px]'}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Main Spinning Ring (Required for loading) */}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-transparent border-t-indigo-500 border-l-indigo-500/30 animate-spin`}
        ></div>

        {/* Inner Static Glow */}
        <div
          className={`absolute ${
            size === "sm" ? "h-1.5 w-1.5" : size === "md" ? "h-3 w-3" : "h-4 w-4"
          } bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]`}
        ></div>
      </div>
      
      {text && (
        <p className="mt-6 text-xs font-black text-indigo-500/80 uppercase tracking-[0.2em] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
