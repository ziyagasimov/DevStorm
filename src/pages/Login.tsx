/**
 * Login Page — Email/password authentication with role-based redirection.
 * Uses Zod validation for input sanitization before Supabase auth call.
 */
import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { loginSchema } from "@/lib/validation";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

/** Maps role to corresponding dashboard URL */
const DASHBOARD_ROUTES: Record<string, string> = {
  speaker: "/dashboard/speaker",
  mentor: "/dashboard/mentor",
  catering: "/dashboard/catering",
  community: "/dashboard/community",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs with Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({ title: "Xəta", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Giriş uğursuz", description: error.message, variant: "destructive" });
      return;
    }

    // Fetch role via SECURITY DEFINER RPC and redirect accordingly
    const userId = authData.user?.id;
    if (userId) {
      const { data: role } = await supabase.rpc("get_user_role", { _user_id: userId });
      const userRole = (role as AppRole) || "user";
      navigate(DASHBOARD_ROUTES[userRole] || "/");
    } else {
      navigate("/");
    }
  }, [email, password, navigate, toast]);

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
                <Input id="email" type="email" placeholder="sizin@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifrə</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={128} />
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
