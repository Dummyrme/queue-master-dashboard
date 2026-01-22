import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QueueItem, QueueStatus } from '@/types/queue';
import { useToast } from '@/hooks/use-toast';

interface DbQueueItem {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  claimed_by: string | null;
  deadline: string | null;
  created_at: string;
  completed_at: string | null;
}

const mapDbToQueueItem = (item: DbQueueItem): QueueItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  price: item.price,
  status: item.status as QueueStatus,
  claimedBy: item.claimed_by,
  deadline: item.deadline ? new Date(item.deadline) : null,
  createdAt: new Date(item.created_at),
  completedAt: item.completed_at ? new Date(item.completed_at) : null,
});

export function useQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('queue_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQueue((data as DbQueueItem[]).map(mapDbToQueueItem));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const queueChannel = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_items' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
    };
  }, [fetchData]);

  const addQueue = async (item: { title: string; description: string; price: number; deadline: Date | null }) => {
    try {
      const { error } = await supabase.from('queue_items').insert({
        title: item.title,
        description: item.description,
        price: item.price,
        deadline: item.deadline?.toISOString() || null,
        status: 'pending',
      });
      if (error) throw error;
      toast({ title: 'เพิ่มงานใหม่แล้ว', description: item.title });
    } catch (error) {
      console.error('Error adding queue:', error);
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  const updateQueue = async (id: string, data: { title: string; description: string; price: number; deadline: Date | null }) => {
    try {
      const { error } = await supabase.from('queue_items').update({
        title: data.title,
        description: data.description,
        price: data.price,
        deadline: data.deadline?.toISOString() || null,
      }).eq('id', id);
      if (error) throw error;
      toast({ title: 'อัพเดทแล้ว', description: data.title });
    } catch (error) {
      console.error('Error updating queue:', error);
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  const claimQueue = async (id: string, username: string) => {
    try {
      const { error } = await supabase.from('queue_items').update({
        claimed_by: username,
        status: 'in-progress',
      }).eq('id', id);
      if (error) throw error;
      toast({ title: 'รับงานแล้ว', description: `${username} รับงานนี้แล้ว` });
    } catch (error) {
      console.error('Error claiming queue:', error);
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  const completeQueue = async (id: string, script?: string) => {
    try {
      const { error } = await supabase
        .from('queue_items')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result_script: script,
        })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'งานเสร็จสมบูรณ์! 🎉', description: 'บันทึก Script เรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error completing queue:', error);
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  const deleteQueue = async (id: string) => {
    try {
      const { error } = await supabase.from('queue_items').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'ลบงานแล้ว' });
    } catch (error) {
      console.error('Error deleting queue:', error);
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  // Calculate worker stats from completed jobs (based on claimed_by username)
  const workerStats = queue
    .filter((q) => q.status === 'completed' && q.claimedBy)
    .reduce((acc, q) => {
      const name = q.claimedBy!;
      if (!acc[name]) {
        acc[name] = { name, completedJobs: 0, totalEarnings: 0 };
      }
      acc[name].completedJobs += 1;
      acc[name].totalEarnings += q.price;
      return acc;
    }, {} as Record<string, { name: string; completedJobs: number; totalEarnings: number }>);

  const stats = {
    totalJobs: queue.length,
    pendingJobs: queue.filter((q) => q.status === 'pending').length,
    inProgressJobs: queue.filter((q) => q.status === 'in-progress').length,
    completedJobs: queue.filter((q) => q.status === 'completed').length,
    totalRevenue: queue.filter((q) => q.status === 'completed').reduce((acc, q) => acc + q.price, 0),
    pendingRevenue: queue.filter((q) => q.status !== 'completed').reduce((acc, q) => acc + q.price, 0),
  };

  return {
    queue,
    loading,
    addQueue,
    updateQueue,
    claimQueue,
    completeQueue,
    deleteQueue,
    stats,
    workerStats: Object.values(workerStats),
  };
}
