/**
 * Speaker Dashboard — Profile management for speaker role users.
 * Allows viewing and editing speaker profile data stored in Supabase.
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
import { Mic, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Tables } from "@/integrations/supabase/types";

type SpeakerProfile = Pick<Tables<"speaker_profiles">,
  "first_name" | "last_name" | "email" | "experience" | "expertise" | "company" | "years_of_experience" | "bio" | "photo_url"
>;

const SpeakerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<SpeakerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<SpeakerProfile>({
    first_name: "", last_name: "", email: "", experience: "", expertise: "", company: "",
    years_of_experience: 0, bio: "", photo_url: null,
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("speaker_profiles")
      .select("first_name, last_name, email, experience, expertise, company, years_of_experience, bio, photo_url")
      .eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) { setProfile(data); setForm(data); }
        setLoading(false);
      });
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("speaker_profiles")
      .update({
        first_name: form.first_name, last_name: form.last_name,
        experience: form.experience, expertise: form.expertise, company: form.company,
        years_of_experience: form.years_of_experience, bio: form.bio, photo_url: form.photo_url,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Xəta", description: error.message, variant: "destructive" });
    } else {
      setProfile(form); setEditing(false);
      toast({ title: "Uğurlu", description: "Profil yeniləndi." });
    }
  }, [user, form, toast]);

  if (loading) return <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Mic size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Spiker Paneli</h1>
              <p className="text-sm text-muted-foreground">Profilinizi idarə edin</p>
            </div>
          </div>
          {!editing && <Button onClick={() => setEditing(true)} variant="outline">Redaktə et</Button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profile?.photo_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{profile?.first_name?.[0]}{profile?.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold text-foreground">{profile?.first_name} {profile?.last_name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.expertise}</p>
              <p className="text-xs text-muted-foreground mt-1">{profile?.company}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-accent rounded-md">{profile?.years_of_experience} il təcrübə</span>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-lg">Profil Məlumatları</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Ad</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} maxLength={100} /></div>
                    <div className="space-y-2"><Label>Soyad</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} maxLength={100} /></div>
                  </div>
                  <div className="space-y-2"><Label>İxtisas</Label><Input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} maxLength={200} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Şirkət</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={200} /></div>
                    <div className="space-y-2"><Label>Təcrübə ili</Label><Input type="number" value={form.years_of_experience} onChange={(e) => setForm({ ...form, years_of_experience: Number(e.target.value) })} min={0} max={99} /></div>
                  </div>
                  <div className="space-y-2"><Label>Təcrübə</Label><Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} maxLength={500} /></div>
                  <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={1000} /></div>
                  <div className="space-y-2"><Label>Profil şəkli URL</Label><Input value={form.photo_url || ""} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} maxLength={500} /></div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}><Save size={16} className="mr-1" />{saving ? "Saxlanılır..." : "Saxla"}</Button>
                    <Button variant="outline" onClick={() => { setEditing(false); if (profile) setForm(profile); }}>Ləğv et</Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div><span className="text-sm font-medium text-muted-foreground">Email:</span> <span className="text-sm text-foreground">{profile?.email}</span></div>
                  <div><span className="text-sm font-medium text-muted-foreground">Təcrübə:</span> <span className="text-sm text-foreground">{profile?.experience || "—"}</span></div>
                  <div><span className="text-sm font-medium text-muted-foreground">Bio:</span> <span className="text-sm text-foreground">{profile?.bio || "—"}</span></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default SpeakerDashboard;
