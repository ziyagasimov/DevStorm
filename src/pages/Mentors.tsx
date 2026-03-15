/**
 * Mentors listing page — Fetches and displays all registered mentors.
 * Uses proper TypeScript types from Supabase generated types.
 */
import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type MentorProfile = Tables<"mentor_profiles">;

const MentorCard = memo(({ m, index, userId, onNavigate }: {
  m: MentorProfile; index: number; userId?: string; onNavigate: (path: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    whileHover={{ y: -4 }}
    className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 p-6"
  >
    <div className="flex items-center gap-4 mb-4">
      <Avatar className="w-12 h-12">
        <AvatarImage src={m.photo_url || ""} />
        <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-sm">{m.first_name[0]}{m.last_name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-foreground font-semibold text-sm">{m.first_name} {m.last_name}</h3>
        <p className="text-muted-foreground text-xs tabular-nums">{m.years_of_experience} il təcrübə</p>
      </div>
    </div>
    <span className="inline-block bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-medium mb-3">{m.expertise_area}</span>
    <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">{m.description}</p>
    <div className="flex gap-2">
      <button onClick={() => onNavigate(`/profile/${m.user_id}`)}
        className="flex-1 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium transition-colors hover:bg-secondary/80">Profil</button>
      {userId && userId !== m.user_id && (
        <button onClick={() => onNavigate(`/profile/${m.user_id}`)}
          className="py-2 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:opacity-90 flex items-center gap-1">
          <MessageCircle size={14} /> Mesaj
        </button>
      )}
    </div>
  </motion.div>
));
MentorCard.displayName = "MentorCard";

const Mentors = () => {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    supabase.from("mentor_profiles").select("*").then(({ data }) => {
      setMentors(data || []);
      setLoading(false);
    });
  }, []);

  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Mentorlar</h1>
        <p className="text-muted-foreground mb-10">İcmanızın inkişafı üçün mentorlarla əlaqə qurun.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-4"><Skeleton className="w-12 h-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div></div>
                <Skeleton className="h-4 w-32" /><Skeleton className="h-12 w-full" />
              </div>
            ))
          : mentors.map((m, i) => (
              <MentorCard key={m.id} m={m} index={i} userId={user?.id} onNavigate={handleNavigate} />
            ))}
        {!loading && mentors.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">Hələ qeydiyyatdan keçmiş mentor yoxdur.</p>
        )}
      </div>
    </div>
  );
};

export default Mentors;
