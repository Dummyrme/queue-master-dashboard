import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Calendar } from 'lucide-react';

interface AddQueueFormProps {
  onAdd: (item: { title: string; description: string; price: number; deadline: Date | null }) => void;
}

export function AddQueueForm({ onAdd }: AddQueueFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim() && price) {
      onAdd({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        deadline: deadline ? new Date(deadline) : null,
      });
      setTitle('');
      setDescription('');
      setPrice('');
      setDeadline('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-14 text-base font-semibold glow-effect"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        เพิ่มงานใหม่
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="queue-card space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">เพิ่มงานใหม่</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="ชื่องาน เช่น ระบบ Combat"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11"
          required
        />
        
        <Textarea
          placeholder="รายละเอียดงานที่ต้องทำ..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] resize-none"
          required
        />
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">฿</span>
            <Input
              type="number"
              placeholder="ราคา"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11 pl-8"
              min="0"
              required
            />
          </div>
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              placeholder="Deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-11 pl-10"
            />
          </div>
          <Button type="submit" className="h-11 px-6 glow-effect">
            เพิ่มงาน
          </Button>
        </div>
      </div>
    </form>
  );
}
