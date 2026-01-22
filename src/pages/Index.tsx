import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { QueueCard } from '@/components/QueueCard';
import { AddQueueForm } from '@/components/AddQueueForm';
import { QueueFilter } from '@/components/QueueFilter';
import { WorkerStats } from '@/components/WorkerStats';
import { PendingApproval } from '@/components/PendingApproval';
import { useQueue } from '@/hooks/useQueue';
import { useDeadlineNotifications } from '@/hooks/useDeadlineNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { QueueStatus } from '@/types/queue';
import { 
  LayoutList, 
  Clock, 
  CheckCircle2, 
  Coins, 
  TrendingUp,
  Loader2
} from 'lucide-react';

const Index = () => {
  const { role, isApproved, profile } = useAuth();
  const isAdmin = role === 'admin';
  
  const { 
    queue, 
    loading,
    addQueue, 
    updateQueue, 
    claimQueue, 
    completeQueue, 
    deleteQueue, 
    stats, 
    workerStats 
  } = useQueue();
  
  // Enable deadline notifications
  useDeadlineNotifications(queue);
  
  const [filter, setFilter] = useState<QueueStatus | 'all'>('all');

  // Show pending approval screen if user is not approved
  if (!isApproved) {
    return <PendingApproval />;
  }

  const filteredQueue = filter === 'all' 
    ? queue 
    : queue.filter((item) => item.status === filter);

  const filterCounts = {
    all: queue.length,
    pending: stats.pendingJobs,
    'in-progress': stats.inProgressJobs,
    completed: stats.completedJobs,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Section - Admin only */}
        {isAdmin && (
          <section className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              ภาพรวม
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                title="งานทั้งหมด"
                value={stats.totalJobs}
                icon={LayoutList}
              />
              <StatCard
                title="รอรับงาน"
                value={stats.pendingJobs}
                icon={Clock}
                variant="primary"
              />
              <StatCard
                title="กำลังทำ"
                value={stats.inProgressJobs}
                icon={Loader2}
                variant="accent"
              />
              <StatCard
                title="เสร็จแล้ว"
                value={stats.completedJobs}
                icon={CheckCircle2}
                variant="success"
              />
              <StatCard
                title="รายได้รวม"
                value={`฿${stats.totalRevenue.toLocaleString()}`}
                subtitle="จากงานที่เสร็จ"
                icon={Coins}
                variant="success"
              />
              <StatCard
                title="รายได้รอรับ"
                value={`฿${stats.pendingRevenue.toLocaleString()}`}
                subtitle="งานที่ยังไม่เสร็จ"
                icon={TrendingUp}
                variant="accent"
              />
            </div>
          </section>
        )}

        {/* Worker Stats Section - Shows in completed tab or all (Admin only) */}
        {isAdmin && (filter === 'all' || filter === 'completed') && workerStats.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              ผู้ทำงาน
            </h2>
            <WorkerStats stats={workerStats} />
          </section>
        )}

        {/* Queue Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              รายการคิว
            </h2>
            <QueueFilter 
              currentFilter={filter} 
              onFilterChange={setFilter}
              counts={filterCounts}
            />
          </div>

          <div className="space-y-4">
            {/* Add form - Admin only */}
            {isAdmin && <AddQueueForm onAdd={addQueue} />}
            
            {filteredQueue.length === 0 ? (
              <div className="queue-card text-center py-12 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                  <LayoutList className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {isAdmin ? 'ไม่มีงานในหมวดนี้' : 'ไม่มีงานสำหรับคุณ'}
                </p>
              </div>
            ) : (
              filteredQueue.map((item, index) => (
                <QueueCard
                  key={item.id}
                  index={index}
                  item={item}
                  onClaim={claimQueue}
                  onComplete={completeQueue}
                  onDelete={isAdmin ? deleteQueue : undefined}
                  onUpdate={isAdmin ? updateQueue : undefined}
                  currentUsername={profile?.username || undefined}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
