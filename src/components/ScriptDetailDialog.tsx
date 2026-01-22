import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Script } from '@/types/queue';
import { useToast } from '@/hooks/use-toast';
import { 
  FileCode, 
  History, 
  Save, 
  Clock, 
  User, 
  Copy, 
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface ScriptDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueItemId: string;
  queueItemTitle: string;
  isAdmin: boolean;
  currentUsername?: string;
}

interface DbScript {
  id: string;
  queue_item_id: string;
  content: string;
  submitted_by: string;
  version: number;
  created_at: string;
}

const mapDbToScript = (item: DbScript): Script => ({
  id: item.id,
  queueItemId: item.queue_item_id,
  content: item.content,
  submittedBy: item.submitted_by,
  version: item.version,
  createdAt: new Date(item.created_at),
});

export function ScriptDetailDialog({
  open,
  onOpenChange,
  queueItemId,
  queueItemTitle,
  isAdmin,
  currentUsername,
}: ScriptDetailDialogProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scripts' as any)
        .select('*')
        .eq('queue_item_id', queueItemId)
        .order('version', { ascending: false });

      if (error) throw error;

      const mappedScripts = ((data || []) as unknown as DbScript[]).map(mapDbToScript);
      setScripts(mappedScripts);

      if (mappedScripts.length > 0) {
        setSelectedVersion(mappedScripts[0].version);
        setEditContent(mappedScripts[0].content);
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูล Script ได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && queueItemId) {
      fetchScripts();
    }
  }, [open, queueItemId]);

  const currentScript = scripts.find((s) => s.version === selectedVersion);
  const latestVersion = scripts[0]?.version || 1;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      // Create new version
      const newVersion = latestVersion + 1;
      const { error } = await supabase.from('scripts' as any).insert({
        queue_item_id: queueItemId,
        content: editContent,
        submitted_by: currentUsername || 'Admin',
        version: newVersion,
      } as any);

      if (error) throw error;

      toast({
        title: 'บันทึกสำเร็จ',
        description: `Script เวอร์ชัน ${newVersion} ถูกบันทึกแล้ว`,
      });

      setIsEditing(false);
      fetchScripts();
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึก Script ได้',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async () => {
    if (currentScript) {
      await navigator.clipboard.writeText(currentScript.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'คัดลอกแล้ว' });
    }
  };

  const navigateVersion = (direction: 'prev' | 'next') => {
    if (!selectedVersion) return;
    const currentIndex = scripts.findIndex((s) => s.version === selectedVersion);
    if (direction === 'prev' && currentIndex < scripts.length - 1) {
      setSelectedVersion(scripts[currentIndex + 1].version);
      setEditContent(scripts[currentIndex + 1].content);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedVersion(scripts[currentIndex - 1].version);
      setEditContent(scripts[currentIndex - 1].content);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (scripts.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ไม่พบ Script</DialogTitle>
            <DialogDescription>
              ยังไม่มี Script สำหรับงานนี้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileCode className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">รายละเอียด Script</DialogTitle>
              <DialogDescription className="mt-1">
                งาน: {queueItemTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Version Navigation - Admin only sees history */}
        {isAdmin && scripts.length > 1 && (
          <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">ประวัติเวอร์ชัน</span>
              <Badge variant="outline">
                {scripts.length} เวอร์ชัน
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateVersion('prev')}
                disabled={selectedVersion === scripts[scripts.length - 1]?.version}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                v{selectedVersion} / v{latestVersion}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateVersion('next')}
                disabled={selectedVersion === latestVersion}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Script Meta Info */}
        {currentScript && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>โดย: {currentScript.submittedBy}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>
                {format(currentScript.createdAt, 'd MMM yyyy HH:mm', { locale: th })}
              </span>
            </div>
            {selectedVersion === latestVersion && (
              <Badge className="bg-success/20 text-success border-success/30">
                ล่าสุด
              </Badge>
            )}
          </div>
        )}

        <Separator />

        {/* Script Content */}
        <ScrollArea className="max-h-[400px]">
          {isEditing && isAdmin ? (
            <Textarea
              className="min-h-[350px] font-mono text-sm bg-secondary/30 border-border"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="แก้ไข Script..."
            />
          ) : (
            <pre className="p-4 bg-secondary/30 rounded-lg font-mono text-sm whitespace-pre-wrap break-words">
              {currentScript?.content}
            </pre>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex-1 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-success" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
            </Button>
          </div>

          {isAdmin && (
            <>
              {isEditing ? (
                <>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    <Save className="w-4 h-4 mr-2" />
                    บันทึกเวอร์ชันใหม่
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  แก้ไข Script
                </Button>
              )}
            </>
          )}

          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
