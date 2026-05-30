import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ScheduleNotesSheetProps {
  schedule: any; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScheduleNotesSheet: React.FC<ScheduleNotesSheetProps> = ({ schedule, open, onOpenChange }) => {
  const [newMessage, setNewMessage] = useState("");

  const messages = [
    { id: 1, sender: "Admin", message: `Proposed schedule for ${schedule?.company?.name}.`, createdAt: "10:00 AM", isAdmin: true },
    { id: 2, sender: "HR", message: "Venue confirmed. Please update students.", createdAt: "11:30 AM", isAdmin: false },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-slate-200">
        <SheetHeader className="p-6 border-b bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold">Communication Log</SheetTitle>
              <SheetDescription className="text-xs font-semibold text-slate-500 uppercase">
                {schedule?.company?.name} • {schedule?.title}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex flex-col gap-1 max-w-[85%]", msg.isAdmin ? "ml-auto items-end" : "items-start")}>
              <span className="text-[10px] font-black uppercase text-slate-400 px-1">{msg.sender}</span>
              <div className={cn("p-3 rounded-2xl text-sm border", msg.isAdmin ? "bg-primary text-primary-foreground rounded-tr-none border-primary" : "bg-white text-slate-700 rounded-tl-none border-slate-200")}>
                {msg.message}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.createdAt}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t">
          <div className="relative">
            <Textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
              className="min-h-[100px] w-full rounded-2xl border-slate-200 bg-white pr-14 focus-visible:ring-primary shadow-sm resize-none"
            />
            <Button disabled={!newMessage.trim()} className="absolute bottom-3 right-3 rounded-xl h-10 w-10 shadow-lg shadow-primary/20">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ScheduleNotesSheet;