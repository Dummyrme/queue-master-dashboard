import { useEffect, useRef } from 'react';
import { QueueItem } from '@/types/queue';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays, isPast } from 'date-fns';

export function useDeadlineNotifications(queue: QueueItem[]) {
  const { toast } = useToast();
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Check for urgent deadlines on load and periodically
    const checkDeadlines = () => {
      queue.forEach((item) => {
        if (item.status === 'completed' || !item.deadline) return;
        
        const daysLeft = differenceInDays(item.deadline, new Date());
        const isOverdue = isPast(item.deadline);
        const notificationKey = `${item.id}-${isOverdue ? 'overdue' : daysLeft}`;

        // Only notify once per unique state
        if (notifiedIds.current.has(notificationKey)) return;

        if (isOverdue) {
          toast({
            title: '⚠️ เลยกำหนดส่งแล้ว!',
            description: `"${item.title}" เลยกำหนดส่งแล้ว!`,
            variant: 'destructive',
          });
          notifiedIds.current.add(notificationKey);
        } else if (daysLeft === 0) {
          toast({
            title: '🔔 ครบกำหนดวันนี้!',
            description: `"${item.title}" ครบกำหนดส่งวันนี้!`,
            variant: 'destructive',
          });
          notifiedIds.current.add(notificationKey);
        } else if (daysLeft <= 2) {
          toast({
            title: '⏰ ใกล้ถึงกำหนด',
            description: `"${item.title}" เหลืออีก ${daysLeft} วัน`,
          });
          notifiedIds.current.add(notificationKey);
        }
      });
    };

    // Check immediately
    checkDeadlines();

    // Check every 30 minutes
    const interval = setInterval(checkDeadlines, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queue, toast]);
}
