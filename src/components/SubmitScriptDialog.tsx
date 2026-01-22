import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, FileCode } from 'lucide-react';

interface SubmitScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (script: string) => void;
  title: string;
}

export function SubmitScriptDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
}: SubmitScriptDialogProps) {
  const [scriptCode, setScriptCode] = useState('');

  const handleSubmit = () => {
    if (scriptCode.trim()) {
      onSubmit(scriptCode);
      setScriptCode('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setScriptCode('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Check className="w-6 h-6 text-success" />
            </div>
            <div>
              <DialogTitle className="text-xl">ยืนยันการส่งงาน</DialogTitle>
              <DialogDescription className="mt-1">
                งาน: {title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileCode className="w-4 h-4" />
            <span>ระบุ Script หรือรายละเอียดงานที่ทำสำเร็จ:</span>
          </div>

          <Textarea
            className="min-h-[300px] font-mono text-sm bg-secondary/30 border-border focus-visible:ring-success/50"
            placeholder="-- วาง Script ของคุณที่นี่ --"
            value={scriptCode}
            onChange={(e) => setScriptCode(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!scriptCode.trim()}
            className="bg-success hover:bg-success/90 text-success-foreground font-bold"
          >
            <Check className="w-4 h-4 mr-2" />
            ส่งงานสำเร็จ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
