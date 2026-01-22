import { useState } from 'react';
import { QueueItem } from '@/types/queue';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { EditQueueDialog } from '@/components/EditQueueDialog';
import { Clock, User, Check, Trash2, Coins, ChevronDown, Hand, Pencil, CalendarClock, AlertTriangle } from 'lucide-react';
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
  const [scriptCode, setScriptCode] = useState('');

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
        {(canClaim || canComplete) && (
          <div className="mt-4 pt-4 border-t border-border/50">
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
                onClick={() => setShowSubmitDialog(true)} // เปลี่ยนตรงนี้
                size="lg"
                className="bg-success hover:bg-success/90 text-success-foreground transition-all duration-200 hover:scale-105"
              >
                <Check className="w-4 h-4 mr-2" />
                ทำเสร็จแล้ว กดส่งงาน
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

      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-border p-6 rounded-xl w-full max-w-lg shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <Check className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold">ยืนยันการส่งงาน</h3>
            </div>
            
            <p className="text-muted-foreground text-sm mb-3">
              ระบุ Source Code หรือรายละเอียดงานที่คุณทำสำเร็จ:
            </p>
            
            <textarea 
              className="w-full h-64 bg-secondary/50 border border-border rounded-lg p-3 text-primary font-mono text-sm focus:ring-2 focus:ring-success/50 outline-none resize-none transition-all"
              placeholder="-- วาง Script ของคุณที่นี่ --"
              value={scriptCode}
              onChange={(e) => setScriptCode(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowSubmitDialog(false);
                  setScriptCode(''); // ล้างข้อมูลเมื่อยกเลิก
                }}
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={() => {
                  onComplete(item.id, scriptCode); // ส่ง id และ code กลับไป
                  setShowSubmitDialog(false);
                }}
                className="bg-success hover:bg-success/90 text-success-foreground font-bold px-6"
                disabled={!scriptCode.trim()} // ถ้าไม่ใส่โค้ดจะกดส่งไม่ได้
              >
                ส่งงานสำเร็จ
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
