import { useEffect, useState } from "react";

export const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    return { hours, minutes, seconds, ampm };
  };

  const { hours, minutes, seconds, ampm } = formatTime(time);

  return (
    <div className="relative overflow-hidden">
      <div className="relative">
        {/* Digital Clock Display */}
        <div className="flex items-baseline gap-1">
          <div className="font-mono text-2xl font-bold tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            {hours.toString().padStart(2, '0')}
            <span className="animate-pulse">:</span>
            {minutes}
          </div>
          <div className="font-mono text-sm font-medium text-muted-foreground tabular-nums">
            {seconds}
          </div>
          <div className="text-xs font-semibold text-primary/80 ml-1">
            {ampm}
          </div>
        </div>

        {/* Date Display */}
        <div className="text-xs text-muted-foreground mt-0.5 font-medium">
          {time.toLocaleDateString(undefined, { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </div>
  );
};