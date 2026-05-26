import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string | Date;
  onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = null;

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else if (onComplete) {
        onComplete();
      }

      setTimeLeft(timeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        LIVE NOW
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 backdrop-blur-md shadow-inner">
        <Timer className="h-3.5 w-3.5 text-indigo-400" />
        <div className="flex items-center gap-1 font-mono text-[12px] font-bold tracking-tight">
          {timeLeft.days > 0 && (
            <div className="flex items-center">
              <span className="text-foreground">{timeLeft.days}</span>
              <span className="ml-0.5 text-[9px] text-muted-foreground uppercase font-sans">d</span>
              <span className="mx-1 text-white/20">:</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="text-foreground">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="ml-0.5 text-[9px] text-muted-foreground uppercase font-sans">h</span>
            <span className="mx-1 text-white/20">:</span>
          </div>
          <div className="flex items-center">
            <span className="text-foreground">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="ml-0.5 text-[9px] text-muted-foreground uppercase font-sans">m</span>
            <span className="mx-1 text-white/20">:</span>
          </div>
          <div className="flex items-center">
            <span className="text-indigo-400">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="ml-0.5 text-[9px] text-indigo-400/70 uppercase font-sans">s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
