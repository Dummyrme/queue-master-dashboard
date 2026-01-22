import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QueueItem } from '@/types/queue';
import { Pencil, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface EditQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: QueueItem | null;
  onSave: (id: string, data: { title: string; description: string; price: number; deadline: Date | null }) => void;
}

export function EditQueueDialog({ open, onOpenChange, item, onSave }: EditQueueDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setPrice(item.price.toString());
      setDeadline(item.deadline ? format(item.deadline, 'yyyy-MM-dd') : '');
    }
  }, [item]);

  const handleSave = () => {
    if (item && title.trim() && description.trim() && price) {
      onSave(item.id, {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        deadline: deadline ? new Date(deadline) : null,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            แก้ไขงาน
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">ชื่องาน</label>
            <Input
              placeholder="ชื่องาน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">รายละเอียด</label>
            <Textarea
              placeholder="รายละเอียดงาน..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">ราคา (บาท)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">฿</span>
                <Input
                  type="number"
                  placeholder="ราคา"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-11 pl-8"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Deadline
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} className="glow-effect">
            บันทึกการแก้ไข
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
