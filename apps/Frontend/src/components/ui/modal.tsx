import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: string;
  preventOutsideClick?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
  maxWidth = "sm:max-w-lg",
  preventOutsideClick,
  showCloseButton = true,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
   <DialogContent
  onInteractOutside={(e) => {
    if (preventOutsideClick) {
      e.preventDefault();
    }
  }}
  showCloseButton={showCloseButton}
  className={cn(
    maxWidth,
    "rounded-[1.5rem] p-0 shadow-2xl",
    "bg-white dark:bg-[#1e1f26] border border-slate-200 dark:border-white/10",

    "max-h-[90vh] overflow-hidden flex flex-col",

    className
  )}
>
        {/* Render a visually hidden title if no title is provided to meet screen reader accessibility requirements */}
        {!title && (
          <DialogTitle className="sr-only">
            {subtitle || "Modal Dialog"}
          </DialogTitle>
        )}
        {(title || subtitle) && (
       <DialogHeader className="p-7 pb-4 space-y-1 border-b border-slate-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1e1f26] z-10">
            {title && (
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-[#e2e2eb] tracking-tight">
                {title}
              </DialogTitle>
            )}
            {subtitle && (
              <DialogDescription className="text-slate-500 dark:text-[#908fa0] font-medium text-sm">
                {subtitle}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
       <div className="p-7 pt-5 overflow-y-auto">
  {children}
</div>
        {footer && (
          <div className="p-7 pt-0 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 mt-2">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
