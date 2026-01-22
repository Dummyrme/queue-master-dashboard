import { useState } from 'react';
import { QueueItem } from '@/types/queue';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { EditQueueDialog } from '@/components/EditQueueDialog';
import { SubmitScriptDialog } from '@/components/SubmitScriptDialog';
import { ScriptDetailDialog } from '@/components/ScriptDetailDialog';
import { Clock, User, Check, Trash2, Coins, ChevronDown, Hand, Pencil, CalendarClock, AlertTriangle, FileCode } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { th } from 'date-fns/locale';

interface QueueCardProps {
  item: QueueItem;
  onClaim: (id: string, name: string) => void;
  onComplete: (id: string, script?: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: { title: string; description: string; price: number; deadline: Date | null }) => void;
  index?: number;
  currentUsername?: string;
  isAdmin?: boolean;
}

export function QueueCard({ 
  item, 
  onClaim, 
  onComplete, 
  onDelete, 
  onUpdate, 
  index = 0,
  currentUsername,
  isAdmin = false 
}: QueueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showScriptDetail, setShowScriptDetail] = useState(false);

  const statusConfig = {
    pending: { label: 'รอรับงาน', class: 'status-pending' },
    'in-progress': { label: 'กำลังทำ', class: 'status-in-progress' },
    completed: { label: 'เสร็จแล้ว', class: 'status-completed' },
  };

  // Check if current user owns this task
  const isOwner = currentUsername && item.claimedBy === currentUsername;

  // Claim with current user's username
  const handleClaim = () => {
    if (currentUsername) {
      onClaim(item.id, currentUsername);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
  };

  const handleSubmitScript = (script: string) => {
    onComplete(item.id, script);
  };

  // Calculate deadline info
  const getDeadlineInfo = () => {
    if (!item.deadline || item.status === 'completed') return null;
    
    const daysLeft = differenceInDays(item.deadline, new Date());
    const isOverdue = isPast(item.deadline);
    
    if (isOverdue) {
      return { text: 'เลยกำหนด!', class: 'text-destructive', urgent: true };
    } else if (daysLeft === 0) {
      return { text: 'ครบกำหนดวันนี้!', class: 'text-warning', urgent: true };
    } else if (daysLeft <= 2) {
      return { text: `เหลือ ${daysLeft} วัน`, class: 'text-warning', urgent: true };
    } else {
      return { text: `เหลือ ${daysLeft} วัน`, class: 'text-muted-foreground', urgent: false };
    }
  };

  const deadlineInfo = getDeadlineInfo();

  // Permissions
  const canEdit = isAdmin && item.status !== 'completed';
  const canDelete = isAdmin;
  const canComplete = item.status === 'in-progress' && (isAdmin || isOwner);
  const canClaim = item.status === 'pending' && currentUsername;
  const canViewScript = item.status === 'completed' && (isAdmin || isOwner);

  return (
    <>
      <div 
        className="queue-card animate-slide-up"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <span className={`status-badge ${statusConfig[item.status].class} transition-all duration-300`}>
                {statusConfig[item.status].label}
              </span>
              {deadlineInfo?.urgent && (
                <span className={`status-badge bg-destructive/20 ${deadlineInfo.class} animate-pulse`}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {deadlineInfo.text}
                </span>
              )}
            </div>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Coins className="w-4 h-4" />
                <span>฿{item.price.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{format(item.createdAt, 'd MMM yyyy', { locale: th })}</span>
              </div>

              {deadlineInfo && !deadlineInfo.urgent && (
                <div className={`flex items-center gap-1.5 ${deadlineInfo.class}`}>
                  <CalendarClock className="w-4 h-4" />
                  <span>{deadlineInfo.text}</span>
                </div>
              )}
              
              {item.claimedBy && (
                <div className="flex items-center gap-1.5 text-accent animate-fade-in">
                  <User className="w-4 h-4" />
                  <span>{item.claimedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Admin only */}
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {canEdit && onUpdate && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEditDialog(true)}
                  className="text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200 hover:scale-110"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Expandable Description */}
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-full text-left group"
          >
            <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </span>
            <span className="font-medium group-hover:text-primary transition-colors">
              ดูรายละเอียดงาน
            </span>
          </button>
          
          <div className={`grid transition-all duration-300 ease-out ${
            isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
          }`}>
            <div className="overflow-hidden">
              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
                {item.deadline && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="w-4 h-4" />
                    <span>Deadline: {format(item.deadline, 'd MMMM yyyy', { locale: th })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(canClaim || canComplete || canViewScript) && (
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-3">
            {canClaim && (
              <Button
                onClick={handleClaim}
                className="glow-effect transition-all duration-200 hover:scale-105"
                size="lg"
              >
                <Hand className="w-4 h-4 mr-2" />
                รับงานนี้
              </Button>
            )}
            
            {canComplete && (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                size="lg"
                className="bg-success hover:bg-success/90 text-success-foreground transition-all duration-200 hover:scale-105"
              >
                <Check className="w-4 h-4 mr-2" />
                ทำเสร็จแล้ว กดส่งงาน
              </Button>
            )}

            {canViewScript && (
              <Button
                onClick={() => setShowScriptDetail(true)}
                variant="outline"
                size="lg"
                className="transition-all duration-200 hover:scale-105"
              >
                <FileCode className="w-4 h-4 mr-2" />
                ดูรายละเอียด Script
              </Button>
            )}
          </div>
        )}
      </div>

      {canDelete && onDelete && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          title={item.title}
        />
      )}

      {canEdit && onUpdate && (
        <EditQueueDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          item={item}
          onSave={onUpdate}
        />
      )}

      <SubmitScriptDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onSubmit={handleSubmitScript}
        title={item.title}
      />

      <ScriptDetailDialog
        open={showScriptDetail}
        onOpenChange={setShowScriptDetail}
        queueItemId={item.id}
        queueItemTitle={item.title}
        isAdmin={isAdmin}
        currentUsername={currentUsername}
      />
    </>
  );
}
