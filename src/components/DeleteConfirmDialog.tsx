import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
}

export function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title 
}: DeleteConfirmDialogProps) {
  const [countdown, setCountdown] = useState(1);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setCountdown(1);
      setCanConfirm(false);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanConfirm(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open]);

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-destructive/30 bg-card animate-scale-in">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse-glow">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg">ยืนยันการลบ</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                การลบจะไม่สามารถกู้คืนได้
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4 px-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm text-muted-foreground mb-1">งานที่จะลบ:</p>
          <p className="font-semibold text-foreground">{title}</p>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="flex-1 sm:flex-none">
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`flex-1 sm:flex-none transition-all duration-300 ${
              canConfirm 
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {canConfirm ? (
              'ยืนยันลบ'
            ) : (
              <span className="flex items-center gap-2">
                รอ {countdown} วินาที
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
