import { motion } from "framer-motion";
import { UtensilsCrossed, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CateringProfile {
  id: string;
  user_id: string;
  company_name: string;
  services_offered: string;
  pricing: string;
  location: string;
  manager_first_name: string;
  manager_last_name: string;
  photo_url: string | null;
}

const Catering = () => {
  const [companies, setCompanies] = useState<CateringProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    supabase.from("catering_profiles").select("*").then(({ data }) => {
      setCompanies((data as any as CateringProfile[]) || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Catering Şirkətləri</h1>
        <p className="text-muted-foreground mb-10">Tədbirləriniz üçün catering xidmətləri tapın.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div>
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          : companies.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 rounded-xl">
                    <AvatarImage src={c.photo_url || ""} />
                    <AvatarFallback className="bg-accent text-accent-foreground rounded-xl">
                      <UtensilsCrossed size={22} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">{c.company_name}</h3>
                    <p className="text-muted-foreground text-xs">{c.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-medium">
                    {c.pricing || "Qiymət göstərilməyib"}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">{c.services_offered}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/profile/${c.user_id}`)}
                    className="flex-1 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium transition-colors hover:bg-secondary/80"
                  >
                    Profil
                  </button>
                  {user && user.id !== c.user_id && (
                    <button
                      onClick={() => navigate(`/profile/${c.user_id}`)}
                      className="py-2 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:opacity-90 flex items-center gap-1"
                    >
                      <MessageCircle size={14} /> Mesaj
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
        {!loading && companies.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">Hələ qeydiyyatdan keçmiş catering şirkəti yoxdur.</p>
        )}
      </div>
    </div>
  );
};

export default Catering;
