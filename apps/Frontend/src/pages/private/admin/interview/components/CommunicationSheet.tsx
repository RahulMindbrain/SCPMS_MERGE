// import React from 'react';
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet.tsx";
// import { Button } from '@/components/ui/button.tsx';
// import { Textarea } from '@/components/ui/textarea.tsx';
// import { MessageSquare, Send, User } from 'lucide-react';
// import { cn } from "@/lib/utils";

// interface CommunicationSheetProps {
//   schedule: any; // Use your InterviewSchedule type
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   // messages should ideally come from Redux, but passed here as props or selected inside
//   messages: any[]; 
// }

// export const CommunicationSheet: React.FC<CommunicationSheetProps> = ({ 
//   schedule, 
//   open, 
//   onOpenChange,
//   messages 
// }) => {
//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
//         <SheetHeader className="p-6 border-b bg-slate-50/50">
//           <SheetTitle className="flex items-center gap-2 text-slate-900">
//             <div className="p-2 bg-primary/10 rounded-lg">
//               <MessageSquare className="w-4 h-4 text-primary" />
//             </div>
//             Activity & Messages
//           </SheetTitle>
//           <SheetDescription className="text-xs uppercase font-bold tracking-tight text-slate-500">
//             {schedule?.company?.name} • {schedule?.title}
//           </SheetDescription>
//         </SheetHeader>

//         {/* Message Thread Area */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
//           {messages.length === 0 ? (
//             <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40">
//               <MessageSquare size={40} strokeWidth={1} />
//               <p className="text-sm font-medium">No messages yet regarding this drive.</p>
//             </div>
//           ) : (
//             messages.map((msg) => {
//               const isAdmin = msg.senderRole === "ADMIN"; // Adjust based on your Auth logic
//               return (
//                 <div key={msg.id} className={cn(
//                   "flex flex-col gap-1.5 max-w-[85%]",
//                   isAdmin ? "ml-auto items-end" : "items-start"
//                 )}>
//                   <div className="flex items-center gap-2 px-1">
//                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                       {msg.senderName}
//                     </span>
//                   </div>
//                   <div className={cn(
//                     "p-3 text-sm shadow-sm border",
//                     isAdmin 
//                       ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none border-primary" 
//                       : "bg-slate-50 text-slate-700 rounded-2xl rounded-tl-none border-slate-200"
//                   )}>
//                     {msg.message}
//                   </div>
//                   <span className="text-[9px] text-muted-foreground font-medium px-1">
//                     {msg.createdAt}
//                   </span>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* Action Area */}
//         <div className="p-4 border-t bg-slate-50">
//           <div className="relative group">
//             <Textarea 
//               placeholder="Send a message to company..." 
//               className="min-h-[100px] rounded-2xl pr-14 resize-none border-slate-200 shadow-inner focus-visible:ring-primary"
//             />
//             <Button 
//               size="icon" 
//               className="absolute bottom-3 right-3 rounded-xl h-10 w-10 shadow-lg shadow-primary/20 transition-transform active:scale-95"
//             >
//               <Send className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// };