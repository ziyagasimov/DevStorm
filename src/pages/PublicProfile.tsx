import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PublicProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    // Get user role
    const { data: roleData } = await supabase
      .from("user_roles" as any).select("role").eq("user_id", userId).single();
    const userRole = (roleData as any)?.role || "user";
    setRole(userRole);

    let profile: any = null;
    if (userRole === "speaker") {
      const { data } = await supabase.from("speaker_profiles" as any).select("*").eq("user_id", userId).single();
      profile = data;
    } else if (userRole === "mentor") {
      const { data } = await supabase.from("mentor_profiles" as any).select("*").eq("user_id", userId).single();
      profile = data;
    } else if (userRole === "catering") {
      const { data } = await supabase.from("catering_profiles" as any).select("*").eq("user_id", userId).single();
      profile = data;
    } else if (userRole === "community") {
      const { data } = await supabase.from("community_profiles" as any).select("*").eq("user_id", userId).single();
      profile = data;
    } else {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      profile = data;
    }

    setProfileData(profile);
    setLoading(false);
  };

  const startChat = async () => {
    if (!user || !userId) return;
    // Check existing conversation
    const { data: myParticipations } = await supabase
      .from("conversation_participants" as any).select("conversation_id").eq("user_id", user.id);
    
    if (myParticipations) {
      for (const p of myParticipations as any[]) {
        const { data: otherP } = await supabase
          .from("conversation_participants" as any).select("user_id")
          .eq("conversation_id", p.conversation_id).eq("user_id", userId);
        if (otherP && (otherP as any[]).length > 0) {
          navigate("/messages");
          return;
        }
      }
    }

    const { data: conv } = await supabase.from("conversations" as any).insert({} as any).select("id").single();
    if (conv) {
      const convId = (conv as any).id;
      await supabase.from("conversation_participants" as any).insert([
        { conversation_id: convId, user_id: user.id },
        { conversation_id: convId, user_id: userId },
      ] as any);
      navigate("/messages");
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!profileData) return <div className="p-6 text-center text-muted-foreground">Profil tapılmadı</div>;

  const getName = () => {
    if (role === "catering") return profileData.company_name;
    if (role === "community") return profileData.community_name;
    return `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();
  };

  const getSubtitle = () => {
    if (role === "speaker") return profileData.expertise;
    if (role === "mentor") return profileData.expertise_area;
    if (role === "catering") return profileData.location;
    if (role === "community") return profileData.locations;
    return "";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 text-muted-foreground">
          <ArrowLeft size={16} className="mr-1" /> Geri
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="w-28 h-28">
                <AvatarImage src={profileData.photo_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">{getName()[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl font-semibold text-foreground">{getName()}</h1>
                  <span className="text-xs px-2 py-0.5 bg-accent text-accent-foreground rounded-full capitalize">{role}</span>
                </div>
                <p className="text-muted-foreground">{getSubtitle()}</p>

                {role === "speaker" && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Şirkət:</span> {profileData.company || "—"}</p>
                    <p><span className="font-medium text-muted-foreground">Təcrübə:</span> {profileData.years_of_experience} il</p>
                    <p><span className="font-medium text-muted-foreground">Bio:</span> {profileData.bio || "—"}</p>
                  </div>
                )}
                {role === "mentor" && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Təcrübə:</span> {profileData.years_of_experience} il</p>
                    <p><span className="font-medium text-muted-foreground">Təsvir:</span> {profileData.description || "—"}</p>
                  </div>
                )}
                {role === "catering" && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Xidmətlər:</span> {profileData.services_offered || "—"}</p>
                    <p><span className="font-medium text-muted-foreground">Qiymət:</span> {profileData.pricing || "—"}</p>
                    <p><span className="font-medium text-muted-foreground">Menecer:</span> {profileData.manager_first_name} {profileData.manager_last_name}</p>
                  </div>
                )}
                {role === "community" && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Təsvir:</span> {profileData.description || "—"}</p>
                    <p><span className="font-medium text-muted-foreground">Tədbir sayı:</span> {profileData.num_events}</p>
                    <p><span className="font-medium text-muted-foreground">Lider:</span> {profileData.leader_first_name} {profileData.leader_last_name}</p>
                  </div>
                )}

                {user && user.id !== userId && (
                  <Button className="mt-4" onClick={startChat}>
                    <MessageCircle size={16} className="mr-1" /> Mesaj göndər
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PublicProfile;
