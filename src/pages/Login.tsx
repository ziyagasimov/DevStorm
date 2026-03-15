import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Xəta", description: "Bütün sahələri doldurun.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast({ title: "Giriş uğursuz", description: error.message, variant: "destructive" });
      return;
    }

    // Get user role and redirect accordingly
    const userId = authData.user?.id;
    if (userId) {
      const { data: roleData } = await supabase.from("user_roles" as any).select("role").eq("user_id", userId).limit(1).maybeSingle();
      const role = (roleData as any)?.role || "user";
      switch (role) {
        case "speaker": navigate("/dashboard/speaker"); break;
        case "mentor": navigate("/dashboard/mentor"); break;
        case "catering": navigate("/dashboard/catering"); break;
        case "community": navigate("/dashboard/community"); break;
        default: navigate("/"); break;
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Commas-a xoş gəldiniz</h1>
          <p className="text-muted-foreground mt-1">Davam etmək üçün daxil olun</p>
        </div>
        <Card className="border-border">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-lg">Daxil ol</CardTitle>
              <CardDescription>Email və şifrənizi daxil edin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="sizin@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifrə</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn size={16} />
                {loading ? "Giriş edilir..." : "Daxil ol"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Hesabınız yoxdur?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">Qeydiyyat</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
