export type QueueStatus = 'pending' | 'in-progress' | 'completed';

export interface QueueItem {
  id: string;
  title: string;
  description: string;
  price: number;
  status: QueueStatus;
  claimedBy: string | null;
  createdAt: Date;
  completedAt: Date | null;
  deadline: Date | null;
}
