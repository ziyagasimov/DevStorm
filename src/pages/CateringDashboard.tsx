/**
 * Catering Dashboard — Profile management for catering role users.
 * Allows viewing and editing catering company profile data stored in Supabase.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { UtensilsCrossed, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Tables } from "@/integrations/supabase/types";

type CateringProfile = Pick<Tables<"catering_profiles">,
  "company_name" | "services_offered" | "pricing" | "location" | "manager_first_name" | "manager_last_name" | "email" | "photo_url"
>;

const CateringDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CateringProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CateringProfile>({
    company_name: "", services_offered: "", pricing: "", location: "",
    manager_first_name: "", manager_last_name: "", email: "", photo_url: null,
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("catering_profiles")
      .select("company_name, services_offered, pricing, location, manager_first_name, manager_last_name, email, photo_url")
      .eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) { setProfile(data); setForm(data); }
        setLoading(false);
      });
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("catering_profiles")
      .update({
        company_name: form.company_name, services_offered: form.services_offered,
        pricing: form.pricing, location: form.location,
        manager_first_name: form.manager_first_name, manager_last_name: form.manager_last_name,
        photo_url: form.photo_url,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Xəta", description: error.message, variant: "destructive" }); }
    else { setProfile(form); setEditing(false); toast({ title: "Uğurlu", description: "Profil yeniləndi." }); }
  }, [user, form, toast]);

  if (loading) return <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><UtensilsCrossed size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Catering Paneli</h1>
              <p className="text-sm text-muted-foreground">Şirkət profilinizi idarə edin</p>
            </div>
          </div>
          {!editing && <Button onClick={() => setEditing(true)} variant="outline">Redaktə et</Button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profile?.photo_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{profile?.company_name?.[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold text-foreground">{profile?.company_name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.location}</p>
              <p className="text-xs text-muted-foreground mt-1">{profile?.pricing}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-lg">Şirkət Məlumatları</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2"><Label>Şirkət adı</Label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} maxLength={200} /></div>
                  <div className="space-y-2"><Label>Xidmətlər</Label><Textarea value={form.services_offered} onChange={(e) => setForm({ ...form, services_offered: e.target.value })} rows={2} maxLength={1000} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Qiymət aralığı</Label><Input value={form.pricing} onChange={(e) => setForm({ ...form, pricing: e.target.value })} maxLength={200} /></div>
                    <div className="space-y-2"><Label>Ünvan</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={300} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Menecer adı</Label><Input value={form.manager_first_name} onChange={(e) => setForm({ ...form, manager_first_name: e.target.value })} maxLength={100} /></div>
                    <div className="space-y-2"><Label>Menecer soyadı</Label><Input value={form.manager_last_name} onChange={(e) => setForm({ ...form, manager_last_name: e.target.value })} maxLength={100} /></div>
                  </div>
                  <div className="space-y-2"><Label>Logo/şəkil URL</Label><Input value={form.photo_url || ""} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} maxLength={500} /></div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}><Save size={16} className="mr-1" />{saving ? "Saxlanılır..." : "Saxla"}</Button>
                    <Button variant="outline" onClick={() => { setEditing(false); if (profile) setForm(profile); }}>Ləğv et</Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div><span className="text-sm font-medium text-muted-foreground">Menecer:</span> <span className="text-sm text-foreground">{profile?.manager_first_name} {profile?.manager_last_name}</span></div>
                  <div><span className="text-sm font-medium text-muted-foreground">Email:</span> <span className="text-sm text-foreground">{profile?.email}</span></div>
                  <div><span className="text-sm font-medium text-muted-foreground">Xidmətlər:</span> <span className="text-sm text-foreground">{profile?.services_offered || "—"}</span></div>
                  <div><span className="text-sm font-medium text-muted-foreground">Qiymət:</span> <span className="text-sm text-foreground">{profile?.pricing || "—"}</span></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default CateringDashboard;
