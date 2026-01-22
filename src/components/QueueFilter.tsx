import { QueueStatus } from '@/types/queue';
import { Button } from '@/components/ui/button';
import { ListFilter, Clock, Loader2, CheckCircle2, LayoutList } from 'lucide-react';

interface QueueFilterProps {
  currentFilter: QueueStatus | 'all';
  onFilterChange: (filter: QueueStatus | 'all') => void;
  counts: {
    all: number;
    pending: number;
    'in-progress': number;
    completed: number;
  };
}

export function QueueFilter({ currentFilter, onFilterChange, counts }: QueueFilterProps) {
  const filters = [
    { key: 'all' as const, label: 'ทั้งหมด', icon: LayoutList, count: counts.all },
    { key: 'pending' as const, label: 'รอรับ', icon: Clock, count: counts.pending },
    { key: 'in-progress' as const, label: 'กำลังทำ', icon: Loader2, count: counts['in-progress'] },
    { key: 'completed' as const, label: 'เสร็จแล้ว', icon: CheckCircle2, count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <ListFilter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      {filters.map(({ key, label, icon: Icon, count }) => (
        <Button
          key={key}
          variant={currentFilter === key ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onFilterChange(key)}
          className={`flex-shrink-0 ${
            currentFilter === key ? 'glow-effect' : ''
          }`}
        >
          <Icon className="w-4 h-4 mr-1.5" />
          {label}
          <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-background/20 text-xs">
            {count}
          </span>
        </Button>
      ))}
    </div>
  );
}
