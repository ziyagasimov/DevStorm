import { useState } from "react";
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
import type { AppRole } from "@/contexts/AuthContext";

const roles: { role: AppRole; title: string; description: string; icon: any }[] = [
  { role: "user", title: "İstifadəçi", description: "Platformanı kəşf edin və icmalara qoşulun", icon: User },
  { role: "speaker", title: "Spiker", description: "Tədbirlərdə çıxış edin və təcrübənizi paylaşın", icon: Mic },
  { role: "mentor", title: "Mentor", description: "Gənclərə mentorluq edin və bilik ötürün", icon: Users },
  { role: "catering", title: "Catering Şirkəti", description: "Tədbirlər üçün qida xidmətləri təqdim edin", icon: UtensilsCrossed },
  { role: "community", title: "İcma", description: "İcmanızı yaradın və tədbirlər təşkil edin", icon: Globe },
];

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Common fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Speaker fields
  const [experience, setExperience] = useState("");
  const [expertise, setExpertise] = useState("");
  const [company, setCompany] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Mentor fields
  const [expertiseArea, setExpertiseArea] = useState("");
  const [mentorDescription, setMentorDescription] = useState("");
  const [mentorExperience, setMentorExperience] = useState("");
  const [mentorYears, setMentorYears] = useState("");

  // Catering fields
  const [companyName, setCompanyName] = useState("");
  const [servicesOffered, setServicesOffered] = useState("");
  const [pricing, setPricing] = useState("");
  const [cateringLocation, setCateringLocation] = useState("");
  const [managerFirstName, setManagerFirstName] = useState("");
  const [managerLastName, setManagerLastName] = useState("");

  // Community fields
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [numEvents, setNumEvents] = useState("");
  const [communityLocations, setCommunityLocations] = useState("");
  const [leaderFirstName, setLeaderFirstName] = useState("");
  const [leaderLastName, setLeaderLastName] = useState("");

  const validate = (): boolean => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Xəta", description: "Email və şifrə mütləqdir.", variant: "destructive" });
      return false;
    }
    if (password.length < 6) {
      toast({ title: "Xəta", description: "Şifrə minimum 6 simvol olmalıdır.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "user" && (!firstName.trim() || !lastName.trim())) {
      toast({ title: "Xəta", description: "Ad və soyad mütləqdir.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "speaker" && (!firstName.trim() || !lastName.trim() || !expertise.trim())) {
      toast({ title: "Xəta", description: "Ad, soyad və ixtisas sahəsi mütləqdir.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "mentor" && (!firstName.trim() || !lastName.trim() || !expertiseArea.trim())) {
      toast({ title: "Xəta", description: "Ad, soyad və ekspertiza sahəsi mütləqdir.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "catering" && (!companyName.trim() || !managerFirstName.trim() || !managerLastName.trim())) {
      toast({ title: "Xəta", description: "Şirkət adı və menecer məlumatları mütləqdir.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "community" && (!communityName.trim() || !leaderFirstName.trim() || !leaderLastName.trim())) {
      toast({ title: "Xəta", description: "İcma adı və lider məlumatları mütləqdir.", variant: "destructive" });
      return false;
    }
    if ((selectedRole === "speaker" && yearsOfExperience && isNaN(Number(yearsOfExperience))) ||
        (selectedRole === "mentor" && mentorYears && isNaN(Number(mentorYears)))) {
      toast({ title: "Xəta", description: "Təcrübə ili rəqəm olmalıdır.", variant: "destructive" });
      return false;
    }
    if (selectedRole === "community" && numEvents && isNaN(Number(numEvents))) {
      toast({ title: "Xəta", description: "Tədbir sayı rəqəm olmalıdır.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !validate()) return;

    setLoading(true);

    const metaData: Record<string, string> = {};
    if (selectedRole === "user") {
      metaData.first_name = firstName.trim();
      metaData.last_name = lastName.trim();
    } else if (selectedRole === "catering") {
      metaData.first_name = managerFirstName.trim();
      metaData.last_name = managerLastName.trim();
    } else if (selectedRole === "community") {
      metaData.first_name = leaderFirstName.trim();
      metaData.last_name = leaderLastName.trim();
    } else {
      metaData.first_name = firstName.trim();
      metaData.last_name = lastName.trim();
    }
    metaData.role = selectedRole;

    const { data: authData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
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

    // Role and base profile are created by the handle_new_user trigger.
    // Here we update role-specific profile with additional fields.
    const userId = authData.user?.id;
    if (userId) {
      if (selectedRole === "speaker") {
        await supabase.from("speaker_profiles").update({
          experience: experience.trim(),
          expertise: expertise.trim(),
          company: company.trim(),
          years_of_experience: Number(yearsOfExperience) || 0,
          bio: bio.trim(),
          photo_url: photoUrl.trim() || null,
        } as any).eq("user_id", userId);
      } else if (selectedRole === "mentor") {
        await supabase.from("mentor_profiles").update({
          experience: mentorExperience.trim(),
          expertise_area: expertiseArea.trim(),
          years_of_experience: Number(mentorYears) || 0,
          description: mentorDescription.trim(),
          photo_url: photoUrl.trim() || null,
        } as any).eq("user_id", userId);
      } else if (selectedRole === "catering") {
        await supabase.from("catering_profiles").update({
          company_name: companyName.trim(),
          services_offered: servicesOffered.trim(),
          pricing: pricing.trim(),
          location: cateringLocation.trim(),
          photo_url: photoUrl.trim() || null,
        } as any).eq("user_id", userId);
      } else if (selectedRole === "community") {
        await supabase.from("community_profiles").update({
          community_name: communityName.trim(),
          description: communityDescription.trim(),
          num_events: Number(numEvents) || 0,
          locations: communityLocations.trim(),
          photo_url: photoUrl.trim() || null,
        } as any).eq("user_id", userId);
      }
    }

    setLoading(false);
    setSentEmail(email);
    setEmailSent(true);
  };

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
                      {roles.find(r => r.role === selectedRole)?.icon && (() => {
                        const Icon = roles.find(r => r.role === selectedRole)!.icon;
                        return <Icon size={18} className="text-primary" />;
                      })()}
                      {roles.find(r => r.role === selectedRole)?.title} Qeydiyyatı
                    </CardTitle>
                    <CardDescription>Məlumatlarınızı daxil edin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Regular User Form */}
                    {selectedRole === "user" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Ad *</Label>
                            <Input id="firstName" placeholder="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Soyad *</Label>
                            <Input id="lastName" placeholder="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} required />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Speaker Form */}
                    {selectedRole === "speaker" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Ad *</Label>
                            <Input placeholder="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Soyad *</Label>
                            <Input placeholder="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>İxtisas / Ekspertiza sahəsi *</Label>
                          <Input placeholder="Məs: Web Development" value={expertise} onChange={e => setExpertise(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Şirkət</Label>
                          <Input placeholder="Şirkət adı" value={company} onChange={e => setCompany(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Təcrübə</Label>
                            <Input placeholder="Təcrübəniz" value={experience} onChange={e => setExperience(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Təcrübə ili</Label>
                            <Input type="number" min="0" placeholder="5" value={yearsOfExperience} onChange={e => setYearsOfExperience(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Textarea placeholder="Özünüz haqqında qısa məlumat..." value={bio} onChange={e => setBio(e.target.value)} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Profil şəkli URL</Label>
                          <Input placeholder="https://..." value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} />
                        </div>
                      </>
                    )}

                    {/* Mentor Form */}
                    {selectedRole === "mentor" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Ad *</Label>
                            <Input placeholder="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Soyad *</Label>
                            <Input placeholder="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Ekspertiza sahəsi *</Label>
                          <Input placeholder="Məs: Data Science" value={expertiseArea} onChange={e => setExpertiseArea(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Təcrübə</Label>
                            <Input placeholder="Təcrübəniz" value={mentorExperience} onChange={e => setMentorExperience(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Təcrübə ili</Label>
                            <Input type="number" min="0" placeholder="5" value={mentorYears} onChange={e => setMentorYears(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Təsvir</Label>
                          <Textarea placeholder="Mentorluq sahəniz haqqında..." value={mentorDescription} onChange={e => setMentorDescription(e.target.value)} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Profil şəkli URL</Label>
                          <Input placeholder="https://..." value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} />
                        </div>
                      </>
                    )}

                    {/* Catering Form */}
                    {selectedRole === "catering" && (
                      <>
                        <div className="space-y-2">
                          <Label>Şirkət adı *</Label>
                          <Input placeholder="Şirkətin adı" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Təklif olunan xidmətlər</Label>
                          <Textarea placeholder="Şirkətin təqdim etdiyi xidmətlər..." value={servicesOffered} onChange={e => setServicesOffered(e.target.value)} rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Qiymət aralığı</Label>
                            <Input placeholder="Məs: 50-500 AZN" value={pricing} onChange={e => setPricing(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Ünvan</Label>
                            <Input placeholder="Bakı, Azərbaycan" value={cateringLocation} onChange={e => setCateringLocation(e.target.value)} />
                          </div>
                        </div>
                        <div className="border-t border-border pt-4 mt-2">
                          <p className="text-sm font-medium text-foreground mb-3">Menecer məlumatları</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Menecer adı *</Label>
                              <Input placeholder="Ad" value={managerFirstName} onChange={e => setManagerFirstName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Menecer soyadı *</Label>
                              <Input placeholder="Soyad" value={managerLastName} onChange={e => setManagerLastName(e.target.value)} required />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Şirkət şəkli/logo URL</Label>
                          <Input placeholder="https://..." value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} />
                        </div>
                      </>
                    )}

                    {/* Community Form */}
                    {selectedRole === "community" && (
                      <>
                        <div className="space-y-2">
                          <Label>İcma adı *</Label>
                          <Input placeholder="İcmanın adı" value={communityName} onChange={e => setCommunityName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label>İcma haqqında</Label>
                          <Textarea placeholder="İcmanın fəaliyyəti və təklif etdikləri..." value={communityDescription} onChange={e => setCommunityDescription(e.target.value)} rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Təşkil olunmuş tədbir sayı</Label>
                            <Input type="number" min="0" placeholder="10" value={numEvents} onChange={e => setNumEvents(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Tədbir məkanları</Label>
                            <Input placeholder="Bakı, Gəncə..." value={communityLocations} onChange={e => setCommunityLocations(e.target.value)} />
                          </div>
                        </div>
                        <div className="border-t border-border pt-4 mt-2">
                          <p className="text-sm font-medium text-foreground mb-3">Lider məlumatları</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Lider adı *</Label>
                              <Input placeholder="Ad" value={leaderFirstName} onChange={e => setLeaderFirstName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Lider soyadı *</Label>
                              <Input placeholder="Soyad" value={leaderLastName} onChange={e => setLeaderLastName(e.target.value)} required />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>İcma şəkli URL</Label>
                          <Input placeholder="https://..." value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} />
                        </div>
                      </>
                    )}

                    {/* Common email/password fields */}
                    <div className="border-t border-border pt-4 mt-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input type="email" placeholder="sizin@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Şifrə *</Label>
                          <Input type="password" placeholder="Minimum 6 simvol" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        </div>
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
