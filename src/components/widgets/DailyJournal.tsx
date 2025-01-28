import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingDown } from "lucide-react";
import { add, startOfWeek } from "date-fns";

type JournalEntry = {
  date: Date;
  content: string;
  profit: number;
};

// Temporary mock data - in a real app this would come from your backend
const mockEntries: JournalEntry[] = [
  {
    date: new Date(2024, 3, 15),
    content: "Spent 2 hours analyzing crypto charts. Made successful trades on ETH.",
    profit: 250.50,
  },
  {
    date: new Date(2024, 3, 16),
    content: "Heavy losses on BTC position. Consulted AI for market analysis.",
    profit: -175.25,
  },
];

export const DailyJournal = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate the start and end of the current week
  const weekStart = selectedDate ? startOfWeek(selectedDate, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = add(weekStart, { days: 6 });

  const getEntryForDate = (date: Date | undefined) => {
    if (!date) return null;
    return mockEntries.find(
      (entry) => entry.date.toDateString() === date.toDateString()
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const selectedEntry = getEntryForDate(selectedDate);

  return (
    <div className="widget-card bg-[#1A1F2C] border-[#6E59A5]/20 min-h-[800px]">
      <h2 className="text-2xl font-semibold mb-8 text-[#9b87f5]">Weekly AI Trading Journal</h2>
      <div className="flex flex-col items-center space-y-8">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-xl border border-[#7E69AB]/20 p-8 w-full max-w-[1200px] shadow-lg bg-[#1A1F2C]/50"
          classNames={{
            months: "space-y-6",
            month: "space-y-6",
            caption: "flex justify-center pt-2 relative items-center text-[#9b87f5] text-2xl mb-6",
            caption_label: "text-2xl font-medium",
            nav: "space-x-2 flex items-center",
            nav_button: cn(
              "h-12 w-12 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity rounded-lg hover:bg-[#6E59A5]/20"
            ),
            table: "w-full border-collapse space-y-2",
            head_row: "flex w-full",
            head_cell: "text-[#D6BCFA] rounded-md w-[14.28%] font-medium text-xl py-4",
            row: "flex w-full mt-3",
            cell: cn(
              "relative p-0 text-center text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#6E59A5]/20 rounded-lg h-32 w-[14.28%] first:rounded-l-lg last:rounded-r-lg",
              "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
              "[&:has([aria-selected].day-outside)]:bg-accent/50",
              "[&:has([aria-selected])]:bg-accent"
            ),
            day: cn(
              "h-full w-full p-3 font-normal text-[#E5DEFF] hover:bg-[#6E59A5]/30 rounded-lg transition-colors flex flex-col justify-start items-center gap-2",
              "aria-selected:opacity-100 hover:text-white"
            ),
            day_selected: "bg-[#8B5CF6] text-white hover:bg-[#8B5CF6] hover:text-white focus:bg-[#8B5CF6] focus:text-white",
            day_today: "bg-[#6E59A5]/30 text-white font-bold",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
          modifiers={{
            profit: (date) => {
              const entry = getEntryForDate(date);
              return entry ? entry.profit > 0 : false;
            },
            loss: (date) => {
              const entry = getEntryForDate(date);
              return entry ? entry.profit < 0 : false;
            },
          }}
          modifiersClassNames={{
            profit: "bg-green-500/20 hover:bg-green-500/30",
            loss: "bg-red-500/20 hover:bg-red-500/30",
          }}
          weekStartsOn={1}
          fromDate={weekStart}
          toDate={weekEnd}
          showOutsideDays={false}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#1A1F2C] border-[#6E59A5]/20">
            <DialogHeader>
              <DialogTitle className="text-[#9b87f5] text-xl">
                Journal Entry - {selectedDate?.toLocaleDateString()}
              </DialogTitle>
            </DialogHeader>
            {selectedEntry ? (
              <div className="space-y-6 p-4">
                <p className="text-[#E5DEFF] text-base leading-relaxed">{selectedEntry.content}</p>
                <div className={cn(
                  "flex items-center gap-2 text-xl font-mono p-4 rounded-lg",
                  selectedEntry.profit > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                )}>
                  {selectedEntry.profit > 0 ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span>
                    {selectedEntry.profit > 0 ? "+" : ""}
                    ${Math.abs(selectedEntry.profit).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#D6BCFA] mb-4">No entry for this date</p>
                <Button 
                  variant="outline"
                  className="bg-[#6E59A5]/20 hover:bg-[#6E59A5]/30 text-[#9b87f5] border-[#6E59A5]/40"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Generate Summary
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};