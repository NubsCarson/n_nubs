import { useEffect, useState } from "react";

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  return (
    <div className="flex items-baseline gap-1.5">
      <div className="text-sm font-medium tabular-nums tracking-tight">
        {hour12.toString().padStart(2, '0')}
        <span className="text-primary/70 mx-px">:</span>
        {minutes.toString().padStart(2, '0')}
      </div>
      <div className="text-[10px] font-medium text-muted-foreground">
        {period}
      </div>
    </div>
  );
}