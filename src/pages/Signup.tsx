/**
 * Signup Page — Multi-role registration with role-specific form fields.
 * 
 * Architecture:
 * - Role selection screen → Dynamic form based on selected role
 * - Uses Supabase Auth signUp with metadata for the handle_new_user trigger
 * - handle_new_user trigger creates profiles, user_roles, and role-specific profiles
 * - Additional role-specific fields are updated after signup via direct table update
 * - Input validation with Zod schemas and HTML maxLength attributes
 */
import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, MailCheck, Mic, Users, UtensilsCrossed, Globe, User, ArrowLeft } from "lucide-react";
import { loginSchema } from "@/lib/validation";
import type { Database } from "@/integrations/supabase/types";
import type { LucideIcon } from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

interface RoleConfig {
  role: AppRole;
  title: string;
  description: string;
  icon: LucideIcon;
}

const roles: RoleConfig[] = [
  { role: "user", title: "İstifadəçi", description: "Platformanı kəşf edin və icmalara qoşulun", icon: User },
  { role: "speaker", title: "Spiker", description: "Tədbirlərdə çıxış edin və təcrübənizi paylaşın", icon: Mic },
  { role: "mentor", title: "Mentor", description: "Gənclərə mentorluq edin və bilik ötürün", icon: Users },
  { role: "catering", title: "Catering Şirkəti", description: "Tədbirlər üçün qida xidmətləri təqdim edin", icon: UtensilsCrossed },
  { role: "community", title: "İcma", description: "İcmanızı yaradın və tədbirlər təşkil edin", icon: Globe },
];

/** Form state for all role-specific fields */
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // Speaker
  experience: string;
  expertise: string;
  company: string;
  yearsOfExperience: string;
  bio: string;
  photoUrl: string;
  // Mentor
  expertiseArea: string;
  mentorDescription: string;
  mentorExperience: string;
  mentorYears: string;
  // Catering
  companyName: string;
  servicesOffered: string;
  pricing: string;
  cateringLocation: string;
  managerFirstName: string;
  managerLastName: string;
  // Community
  communityName: string;
  communityDescription: string;
  numEvents: string;
  communityLocations: string;
  leaderFirstName: string;
  leaderLastName: string;
}

const initialFormState: FormState = {
  firstName: "", lastName: "", email: "", password: "",
  experience: "", expertise: "", company: "", yearsOfExperience: "", bio: "", photoUrl: "",
  expertiseArea: "", mentorDescription: "", mentorExperience: "", mentorYears: "",
  companyName: "", servicesOffered: "", pricing: "", cateringLocation: "", managerFirstName: "", managerLastName: "",
  communityName: "", communityDescription: "", numEvents: "", communityLocations: "", leaderFirstName: "", leaderLastName: "",
};

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [form, setForm] = useState<FormState>(initialFormState);
  const { toast } = useToast();
  const navigate = useNavigate();

  /** Update a single form field */
  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  /** Validate required fields based on role */
  const validate = useCallback((): boolean => {
    // Validate email & password with Zod
    const baseValidation = loginSchema.safeParse({ email: form.email, password: form.password });
    if (!baseValidation.success) {
      toast({ title: "Xəta", description: baseValidation.error.errors[0].message, variant: "destructive" });
      return false;
    }

    if (selectedRole === "user" && (!form.firstName.trim() || !form.lastName.trim())) {
      toast({ title: "Xəta", description: "Ad və soyad mütləqdir.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "speaker" && (!form.firstName.trim() || !form.lastName.trim() || !form.expertise.trim())) {
      toast({ title: "Xəta", description: "Ad, soyad və ixtisas sahəsi mütləqdir.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "mentor" && (!form.firstName.trim() || !form.lastName.trim() || !form.expertiseArea.trim())) {
      toast({ title: "Xəta", description: "Ad, soyad və ekspertiza sahəsi mütləqdir.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "catering" && (!form.companyName.trim() || !form.managerFirstName.trim() || !form.managerLastName.trim())) {
      toast({ title: "Xəta", description: "Şirkət adı və menecer məlumatları mütləqdir.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "community" && (!form.communityName.trim() || !form.leaderFirstName.trim() || !form.leaderLastName.trim())) {
      toast({ title: "Xəta", description: "İcma adı və lider məlumatları mütləqdir.", variant: "destructive" });
      return false;
    }

    // Validate numeric fields
    if ((selectedRole === "speaker" && form.yearsOfExperience && isNaN(Number(form.yearsOfExperience))) ||
        (selectedRole === "mentor" && form.mentorYears && isNaN(Number(form.mentorYears)))) {
      toast({ title: "Xəta", description: "Təcrübə ili rəqəm olmalıdır.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "community" && form.numEvents && isNaN(Number(form.numEvents))) {
      toast({ title: "Xəta", description: "Tədbir sayı rəqəm olmalıdır.", variant: "destructive" });
      return false;
    }
    return true;
  }, [form, selectedRole, toast]);

  /** Handle form submission — signup + role-specific profile update */
  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !validate()) return;

    setLoading(true);

    // Determine metadata names based on role
    const metaData: Record<string, string> = { role: selectedRole };
    if (selectedRole === "catering") {
      metaData.first_name = form.managerFirstName.trim();
      metaData.last_name = form.managerLastName.trim();
    } else if (selectedRole === "community") {
      metaData.first_name = form.leaderFirstName.trim();
      metaData.last_name = form.leaderLastName.trim();
    } else {
      metaData.first_name = form.firstName.trim();
      metaData.last_name = form.lastName.trim();
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: metaData,
        emailRedirectTo: window.location.origin + "/login",
      },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Qeydiyyat uğursuz", description: error.message, variant: "destructive" });
      return;
    }

    // Update role-specific profile with additional fields (base profile created by trigger)
    const userId = authData.user?.id;
    if (userId) {
      if (selectedRole === "speaker") {
        await supabase.from("speaker_profiles").update({
          experience: form.experience.trim(),
          expertise: form.expertise.trim(),
          company: form.company.trim(),
          years_of_experience: Number(form.yearsOfExperience) || 0,
          bio: form.bio.trim(),
          photo_url: form.photoUrl.trim() || null,
        }).eq("user_id", userId);
      } else if (selectedRole === "mentor") {
        await supabase.from("mentor_profiles").update({
          experience: form.mentorExperience.trim(),
          expertise_area: form.expertiseArea.trim(),
          years_of_experience: Number(form.mentorYears) || 0,
          description: form.mentorDescription.trim(),
          photo_url: form.photoUrl.trim() || null,
        }).eq("user_id", userId);
      } else if (selectedRole === "catering") {
        await supabase.from("catering_profiles").update({
          company_name: form.companyName.trim(),
          services_offered: form.servicesOffered.trim(),
          pricing: form.pricing.trim(),
          location: form.cateringLocation.trim(),
          photo_url: form.photoUrl.trim() || null,
        }).eq("user_id", userId);
      } else if (selectedRole === "community") {
        await supabase.from("community_profiles").update({
          community_name: form.communityName.trim(),
          description: form.communityDescription.trim(),
          num_events: Number(form.numEvents) || 0,
          locations: form.communityLocations.trim(),
          photo_url: form.photoUrl.trim() || null,
        }).eq("user_id", userId);
      }
    }

    setLoading(false);
    setSentEmail(form.email);
    setEmailSent(true);
  }, [selectedRole, form, validate, toast]);

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MailCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Emailinizi yoxlayın</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            <span className="font-medium text-foreground">{sentEmail}</span> ünvanına təsdiq mesajı göndərdik.
            Emailinizdəki linkə klikləyərək hesabınızı təsdiqləyin, sonra daxil olun.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">Daxil ol səhifəsinə qayıt</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Qeydiyyatdan keçin</h1>
          <p className="text-muted-foreground mt-1">Hesab növünüzü seçin və qeydiyyatdan keçin</p>
        </div>

        {!selectedRole ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((r) => (
                <motion.button
                  key={r.role}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(r.role)}
                  className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-card-hover transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <r.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{r.title}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">{r.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Artıq hesabınız var?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">Daxil olun</Link>
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selectedRole} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} className="mb-4 text-muted-foreground">
                <ArrowLeft size={16} className="mr-1" /> Geri
              </Button>
              <Card className="border-border">
                <form onSubmit={handleSignup}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {(() => { const Icon = roles.find((r) => r.role === selectedRole)!.icon; return <Icon size={18} className="text-primary" />; })()}
                      {roles.find((r) => r.role === selectedRole)?.title} Qeydiyyatı
                    </CardTitle>
                    <CardDescription>Məlumatlarınızı daxil edin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Regular User Form */}
                    {selectedRole === "user" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2"><Label htmlFor="firstName">Ad *</Label><Input id="firstName" placeholder="Ad" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required maxLength={100} /></div>
                        <div className="space-y-2"><Label htmlFor="lastName">Soyad *</Label><Input id="lastName" placeholder="Soyad" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required maxLength={100} /></div>
                      </div>
                    )}

                    {/* Speaker Form */}
                    {selectedRole === "speaker" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2"><Label>Ad *</Label><Input placeholder="Ad" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required maxLength={100} /></div>
                          <div className="space-y-2"><Label>Soyad *</Label><Input placeholder="Soyad" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required maxLength={100} /></div>
                        </div>
                        <div className="space-y-2"><Label>İxtisas / Ekspertiza sahəsi *</Label><Input placeholder="Məs: Web Development" value={form.expertise} onChange={(e) => updateField("expertise", e.target.value)} required maxLength={200} /></div>
                        <div className="space-y-2"><Label>Şirkət</Label><Input placeholder="Şirkət adı" value={form.company} onChange={(e) => updateField("company", e.target.value)} maxLength={200} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2"><Label>Təcrübə</Label><Input placeholder="Təcrübəniz" value={form.experience} onChange={(e) => updateField("experience", e.target.value)} maxLength={500} /></div>
                          <div className="space-y-2"><Label>Təcrübə ili</Label><Input type="number" min="0" max="99" placeholder="5" value={form.yearsOfExperience} onChange={(e) => updateField("yearsOfExperience", e.target.value)} /></div>
                        </div>
                        <div className="space-y-2"><Label>Bio</Label><Textarea placeholder="Özünüz haqqında qısa məlumat..." value={form.bio} onChange={(e) => updateField("bio", e.target.value)} rows={3} maxLength={1000} /></div>
                        <div className="space-y-2"><Label>Profil şəkli URL</Label><Input placeholder="https://..." value={form.photoUrl} onChange={(e) => updateField("photoUrl", e.target.value)} maxLength={500} /></div>
                      </>
                    )}

                    {/* Mentor Form */}
                    {selectedRole === "mentor" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2"><Label>Ad *</Label><Input placeholder="Ad" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required maxLength={100} /></div>
                          <div className="space-y-2"><Label>Soyad *</Label><Input placeholder="Soyad" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required maxLength={100} /></div>
                        </div>
                        <div className="space-y-2"><Label>Ekspertiza sahəsi *</Label><Input placeholder="Məs: Data Science" value={form.expertiseArea} onChange={(e) => updateField("expertiseArea", e.target.value)} required maxLength={200} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2"><Label>Təcrübə</Label><Input placeholder="Təcrübəniz" value={form.mentorExperience} onChange={(e) => updateField("mentorExperience", e.target.value)} maxLength={500} /></div>
                          <div className="space-y-2"><Label>Təcrübə ili</Label><Input type="number" min="0" max="99" placeholder="5" value={form.mentorYears} onChange={(e) => updateField("mentorYears", e.target.value)} /></div>
                        </div>
                        <div className="space-y-2"><Label>Təsvir</Label><Textarea placeholder="Mentorluq sahəniz haqqında..." value={form.mentorDescription} onChange={(e) => updateField("mentorDescription", e.target.value)} rows={3} maxLength={1000} /></div>
                        <div className="space-y-2"><Label>Profil şəkli URL</Label><Input placeholder="https://..." value={form.photoUrl} onChange={(e) => updateField("photoUrl", e.target.value)} maxLength={500} /></div>
                      </>
                    )}

                    {/* Catering Form */}
                    {selectedRole === "catering" && (
                      <>
                        <div className="space-y-2"><Label>Şirkət adı *</Label><Input placeholder="Şirkətin adı" value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)} required maxLength={200} /></div>
                        <div className="space-y-2"><Label>Təklif olunan xidmətlər</Label><Textarea placeholder="Şirkətin təqdim etdiyi xidmətlər..." value={form.servicesOffered} onChange={(e) => updateField("servicesOffered", e.target.value)} rows={2} maxLength={1000} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2"><Label>Qiymət aralığı</Label><Input placeholder="Məs: 50-500 AZN" value={form.pricing} onChange={(e) => updateField("pricing", e.target.value)} maxLength={200} /></div>
                          <div className="space-y-2"><Label>Ünvan</Label><Input placeholder="Bakı, Azərbaycan" value={form.cateringLocation} onChange={(e) => updateField("cateringLocation", e.target.value)} maxLength={300} /></div>
                        </div>
                        <div className="border-t border-border pt-4 mt-2">
                          <p className="text-sm font-medium text-foreground mb-3">Menecer məlumatları</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2"><Label>Menecer adı *</Label><Input placeholder="Ad" value={form.managerFirstName} onChange={(e) => updateField("managerFirstName", e.target.value)} required maxLength={100} /></div>
                            <div className="space-y-2"><Label>Menecer soyadı *</Label><Input placeholder="Soyad" value={form.managerLastName} onChange={(e) => updateField("managerLastName", e.target.value)} required maxLength={100} /></div>
                          </div>
                        </div>
                        <div className="space-y-2"><Label>Şirkət şəkli/logo URL</Label><Input placeholder="https://..." value={form.photoUrl} onChange={(e) => updateField("photoUrl", e.target.value)} maxLength={500} /></div>
                      </>
                    )}

                    {/* Community Form */}
                    {selectedRole === "community" && (
                      <>
                        <div className="space-y-2"><Label>İcma adı *</Label><Input placeholder="İcmanın adı" value={form.communityName} onChange={(e) => updateField("communityName", e.target.value)} required maxLength={200} /></div>
                        <div className="space-y-2"><Label>İcma haqqında</Label><Textarea placeholder="İcmanın fəaliyyəti və təklif etdikləri..." value={form.communityDescription} onChange={(e) => updateField("communityDescription", e.target.value)} rows={2} maxLength={1000} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2"><Label>Təşkil olunmuş tədbir sayı</Label><Input type="number" min="0" max="9999" placeholder="10" value={form.numEvents} onChange={(e) => updateField("numEvents", e.target.value)} /></div>
                          <div className="space-y-2"><Label>Tədbir məkanları</Label><Input placeholder="Bakı, Gəncə..." value={form.communityLocations} onChange={(e) => updateField("communityLocations", e.target.value)} maxLength={300} /></div>
                        </div>
                        <div className="border-t border-border pt-4 mt-2">
                          <p className="text-sm font-medium text-foreground mb-3">Lider məlumatları</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2"><Label>Lider adı *</Label><Input placeholder="Ad" value={form.leaderFirstName} onChange={(e) => updateField("leaderFirstName", e.target.value)} required maxLength={100} /></div>
                            <div className="space-y-2"><Label>Lider soyadı *</Label><Input placeholder="Soyad" value={form.leaderLastName} onChange={(e) => updateField("leaderLastName", e.target.value)} required maxLength={100} /></div>
                          </div>
                        </div>
                        <div className="space-y-2"><Label>İcma şəkli URL</Label><Input placeholder="https://..." value={form.photoUrl} onChange={(e) => updateField("photoUrl", e.target.value)} maxLength={500} /></div>
                      </>
                    )}

                    {/* Common email/password fields */}
                    <div className="border-t border-border pt-4 mt-2">
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="sizin@email.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} required maxLength={255} /></div>
                        <div className="space-y-2"><Label>Şifrə *</Label><Input type="password" placeholder="Minimum 6 simvol" value={form.password} onChange={(e) => updateField("password", e.target.value)} required minLength={6} maxLength={128} /></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={loading}>
                      <UserPlus size={16} />
                      {loading ? "Yaradılır..." : "Hesab yarat"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Artıq hesabınız var?{" "}
                      <Link to="/login" className="text-primary hover:underline font-medium">Daxil olun</Link>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default Signup;
