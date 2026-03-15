import { motion } from "framer-motion";
import { Mic, Users, UtensilsCrossed, Globe, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const cards = [
  {
    title: "Speakers",
    description: "Discover experienced speakers for your events and community meetups.",
    icon: Mic,
    href: "/speakers",
  },
  {
    title: "Mentors",
    description: "Connect with mentors who can guide your members and help your community grow.",
    icon: Users,
    href: "/mentors",
  },
  {
    title: "Catering Companies",
    description: "Find catering services for meetups, hackathons, and community events.",
    icon: UtensilsCrossed,
    href: "/catering",
  },
  {
    title: "Communities",
    description: "Explore existing communities and collaborate with them.",
    icon: Globe,
    href: "/communities",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartBuilding = () => {
    if (user) {
      navigate("/communities");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="mb-16"
      >
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
          Build and Grow Communities Faster
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mb-8">
          A platform that helps you find speakers, mentors, partners, and services for building successful communities.
        </p>
        <div className="flex gap-4 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartBuilding}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:opacity-90"
          >
            Start Building a Community
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/communities")}
            className="px-6 py-2.5 bg-card text-foreground border border-border rounded-lg text-sm font-medium transition-colors hover:bg-secondary"
          >
            Explore Communities
          </motion.button>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -4 }}
            onClick={() => navigate(card.href)}
            className="group p-6 bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground mb-4">
              <card.icon size={20} />
            </div>
            <h3 className="text-foreground font-semibold mb-2 text-sm">{card.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{card.description}</p>
            <span className="text-sm font-medium text-primary group-hover:underline inline-flex items-center gap-1">
              Explore <ArrowRight size={14} />
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Index;
