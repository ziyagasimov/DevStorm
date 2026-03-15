/**
 * PublicProfile — Displays a user's public profile based on their role.
 * Fetches role via RPC and then loads the corresponding profile table.
 * Uses `create_conversation` RPC for atomic chat creation.
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Tables, Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

// Union type for all possible profile shapes
type ProfileData =
  | Tables<"speaker_profiles">
  | Tables<"mentor_profiles">
  | Tables<"catering_profiles">
  | Tables<"community_profiles">
  | Tables<"profiles">;

const PublicProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    // Fetch role via SECURITY DEFINER RPC — avoids RLS issues
    const { data: userRole } = await supabase.rpc("get_user_role", { _user_id: userId! });
    const resolvedRole = (userRole as AppRole) || "user";
    setRole(resolvedRole);

    let profile: ProfileData | null = null;

    // Load role-specific profile from corresponding table
    if (resolvedRole === "speaker") {
      const { data } = await supabase.from("speaker_profiles").select("*").eq("user_id", userId!).single();
      profile = data;
    } else if (resolvedRole === "mentor") {
      const { data } = await supabase.from("mentor_profiles").select("*").eq("user_id", userId!).single();
      profile = data;
    } else if (resolvedRole === "catering") {
      const { data } = await supabase.from("catering_profiles").select("*").eq("user_id", userId!).single();
      profile = data;
    } else if (resolvedRole === "community") {
      const { data } = await supabase.from("community_profiles").select("*").eq("user_id", userId!).single();
      profile = data;
    } else {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId!).single();
      profile = data;
    }

    setProfileData(profile);
    setLoading(false);
  };

  /** Start chat using atomic RPC — prevents race conditions with RLS */
  const startChat = useCallback(async () => {
    if (!user || !userId) return;

    const { data: convId, error } = await supabase.rpc("create_conversation", {
      other_user_id: userId,
    });

    if (convId && !error) {
      navigate("/messages");
    }
  }, [user, userId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return <div className="p-6 text-center text-muted-foreground">Profil tapılmadı</div>;
  }

  // Type-safe accessors based on role
  const getName = () => {
    if (role === "catering" && "company_name" in profileData) return profileData.company_name;
    if (role === "community" && "community_name" in profileData) return profileData.community_name;
    if ("first_name" in profileData) return `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();
    return "İstifadəçi";
  };

  const getSubtitle = () => {
    if (role === "speaker" && "expertise" in profileData) return profileData.expertise;
    if (role === "mentor" && "expertise_area" in profileData) return profileData.expertise_area;
    if (role === "catering" && "location" in profileData) return profileData.location;
    if (role === "community" && "locations" in profileData) return profileData.locations;
    return "";
  };

  const getPhotoUrl = () => {
    if ("photo_url" in profileData) return profileData.photo_url;
    return null;
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
                <AvatarImage src={getPhotoUrl() || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">{getName()[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl font-semibold text-foreground">{getName()}</h1>
                  <span className="text-xs px-2 py-0.5 bg-accent text-accent-foreground rounded-full capitalize">{role}</span>
                </div>
                <p className="text-muted-foreground">{getSubtitle()}</p>

                {role === "speaker" && "company" in profileData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Şirkət:</span> {profileData.company || "—"}</p>
                    <p><span className="font-medium text-muted-foreground">Təcrübə:</span> {"years_of_experience" in profileData ? profileData.years_of_experience : 0} il</p>
                    <p><span className="font-medium text-muted-foreground">Bio:</span> {"bio" in profileData ? profileData.bio : "—"}</p>
                  </div>
                )}
                {role === "mentor" && "description" in profileData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Təcrübə:</span> {"years_of_experience" in profileData ? profileData.years_of_experience : 0} il</p>
                    <p><span className="font-medium text-muted-foreground">Təsvir:</span> {profileData.description || "—"}</p>
                  </div>
                )}
                {role === "catering" && "services_offered" in profileData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Xidmətlər:</span> {profileData.services_offered || "—"}</p>
                    <p><span className="font-medium text-muted-foreground">Qiymət:</span> {"pricing" in profileData ? profileData.pricing : "—"}</p>
                    <p><span className="font-medium text-muted-foreground">Menecer:</span> {"manager_first_name" in profileData ? `${profileData.manager_first_name} ${profileData.manager_last_name}` : "—"}</p>
                  </div>
                )}
                {role === "community" && "description" in profileData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium text-muted-foreground">Təsvir:</span> {profileData.description || "—"}</p>
                    <p><span className="font-medium text-muted-foreground">Tədbir sayı:</span> {"num_events" in profileData ? profileData.num_events : 0}</p>
                    <p><span className="font-medium text-muted-foreground">Lider:</span> {"leader_first_name" in profileData ? `${profileData.leader_first_name} ${profileData.leader_last_name}` : "—"}</p>
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
