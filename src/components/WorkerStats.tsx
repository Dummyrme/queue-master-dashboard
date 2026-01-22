import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, User, Trophy, Coins } from 'lucide-react';

interface WorkerStat {
  name: string;
  completedJobs: number;
  totalEarnings: number;
}

interface WorkerStatsProps {
  stats: WorkerStat[];
}

export function WorkerStats({ stats }: WorkerStatsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStats = stats.filter((worker) =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStats = [...filteredStats].sort((a, b) => b.completedJobs - a.completedJobs);

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="queue-card animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">สถิติผู้ทำงาน</h3>
        </div>
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {sortedStats.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          ไม่พบผู้ทำงานที่ค้นหา
        </p>
      ) : (
        <div className="space-y-2">
          {sortedStats.map((worker, index) => (
            <div
              key={worker.name}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-secondary/50 ${
                index === 0 ? 'bg-warning/10 border border-warning/30' : 'bg-secondary/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 
                    ? 'bg-warning text-warning-foreground' 
                    : index === 1 
                    ? 'bg-muted-foreground/30 text-foreground'
                    : index === 2
                    ? 'bg-orange-700/30 text-orange-400'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <span className="font-medium">{worker.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="font-semibold text-foreground">{worker.completedJobs}</span>
                  <span>งาน</span>
                </div>
                <div className="flex items-center gap-1.5 text-success">
                  <Coins className="w-4 h-4" />
                  <span className="font-semibold">฿{worker.totalEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
