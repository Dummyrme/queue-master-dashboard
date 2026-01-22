import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Code2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('อีเมลไม่ถูกต้อง');
const passwordSchema = z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
const usernameSchema = z.string().min(2, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร').max(20, 'ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร');

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const validateInputs = (isSignup: boolean) => {
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
        return false;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
        return false;
      }
    }

    if (isSignup) {
      try {
        usernameSchema.parse(username);
      } catch (e) {
        if (e instanceof z.ZodError) {
          setError(e.errors[0].message);
          return false;
        }
      }
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateInputs(false)) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateInputs(true)) return;

    setLoading(true);
    const { error } = await signUp(email, password, username);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setSuccess('สมัครสมาชิกสำเร็จ! รอ Admin อนุมัติสิทธิ์ก่อนถึงจะใช้งานได้');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
              <Code2 className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Script<span className="text-gradient-primary">Queue</span>
            </h1>
            <p className="text-sm text-muted-foreground">Roblox Script Management</p>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle>ยินดีต้อนรับ</CardTitle>
            <CardDescription>
              {tab === 'login' ? 'เข้าสู่ระบบเพื่อจัดการงาน' : 'สมัครสมาชิกเพื่อเริ่มใช้งาน'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => { setTab(v as 'login' | 'signup'); setError(null); setSuccess(null); }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">อีเมล</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">รหัสผ่าน</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full glow-effect" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'เข้าสู่ระบบ'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">ชื่อผู้ใช้</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="เช่น _h2o"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">อีเมล</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">รหัสผ่าน</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--success))] bg-success/10 p-3 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {success}
                    </div>
                  )}

                  <Button type="submit" className="w-full glow-effect" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'สมัครสมาชิก'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          หลังสมัครสมาชิก ต้องรอ Admin อนุมัติก่อนถึงจะเห็นงานได้
        </p>
      </div>
    </div>
  );
}
