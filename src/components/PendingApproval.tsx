import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function PendingApproval() {
  const { profile, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border bg-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-warning" />
          </div>
          <CardTitle>รอการอนุมัติ</CardTitle>
          <CardDescription>
            สวัสดี <span className="font-semibold text-foreground">{profile?.username}</span>!
            <br />
            บัญชีของคุณกำลังรอ Admin อนุมัติสิทธิ์
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            เมื่อ Admin อนุมัติแล้ว คุณจะสามารถเข้าใช้งานระบบได้
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="w-full"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              ตรวจสอบสถานะ
            </Button>
            <Button 
              onClick={signOut} 
              variant="ghost" 
              className="w-full text-muted-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
