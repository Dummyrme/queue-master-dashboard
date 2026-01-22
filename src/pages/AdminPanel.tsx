import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Crown, Loader2, Shield, User, UserCheck, UserX } from 'lucide-react';

interface UserWithRole {
  id: string;
  user_id: string;
  username: string;
  role: 'admin' | 'user' | null;
  created_at: string;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { role: currentUserRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserRole !== 'admin') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [currentUserRole, navigate]);

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          username: profile.username,
          role: userRole ? (userRole.role as 'admin' | 'user') : null,
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดรายชื่อผู้ใช้ได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user' | 'none') => {
    setUpdating(userId);

    try {
      if (newRole === 'none') {
        // Remove role (set user to pending)
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Check if user already has a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingRole) {
          // Update existing role
          const { error } = await supabase
            .from('user_roles')
            .update({ role: newRole })
            .eq('user_id', userId);

          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: newRole });

          if (error) throw error;
        }
      }

      toast({
        title: 'อัพเดทสิทธิ์แล้ว',
        description: newRole === 'none' ? 'ถอนสิทธิ์ผู้ใช้แล้ว' : `กำหนดสิทธิ์เป็น ${newRole} แล้ว`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัพเดทสิทธิ์ได้',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadge = (role: 'admin' | 'user' | null) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-primary/20 text-primary border-0">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'user':
        return (
          <Badge className="bg-accent/20 text-accent border-0">
            <UserCheck className="w-3 h-3 mr-1" />
            User
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <UserX className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">จัดการผู้ใช้</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              รายชื่อผู้ใช้ทั้งหมด
            </CardTitle>
            <CardDescription>
              กำหนดสิทธิ์ให้ผู้ใช้แต่ละคน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  ยังไม่มีผู้ใช้ในระบบ
                </p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          สมัครเมื่อ {new Date(user.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getRoleBadge(user.role)}
                      
                      <Select
                        value={user.role || 'none'}
                        onValueChange={(value) => updateUserRole(user.user_id, value as 'admin' | 'user' | 'none')}
                        disabled={updating === user.user_id}
                      >
                        <SelectTrigger className="w-[130px]">
                          {updating === user.user_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="none">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
