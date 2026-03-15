import { motion } from "framer-motion";
import speakerSarah from "@/assets/speaker-sarah.jpg";
import speakerDavid from "@/assets/speaker-david.jpg";
import speakerAnna from "@/assets/speaker-anna.jpg";

const speakers = [
  {
    name: "Sarah Chen",
    expertise: "AI & Machine Learning",
    company: "OpenAI",
    bio: "AI engineer passionate about making machine learning accessible to developer communities worldwide.",
    photo: speakerSarah,
  },
  {
    name: "David Martinez",
    expertise: "Startup Growth",
    company: "YC Alumni",
    bio: "Serial entrepreneur and YC alum who loves sharing lessons on building products and scaling teams.",
    photo: speakerDavid,
  },
  {
    name: "Anna Petrova",
    expertise: "Developer Relations",
    company: "Google",
    bio: "DevRel lead focused on building bridges between engineering teams and developer communities.",
    photo: speakerAnna,
  },
];

const Speakers = () => (
  <div className="max-w-6xl mx-auto py-12 px-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Speakers</h1>
      <p className="text-muted-foreground mb-10">Discover experienced speakers for your events and community meetups.</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {speakers.map((s, i) => (
        <motion.div
          key={s.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{ y: -4 }}
          className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <img src={s.photo} alt={s.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="text-foreground font-semibold text-sm">{s.name}</h3>
              <p className="text-muted-foreground text-xs">{s.company}</p>
            </div>
          </div>
          <span className="inline-block bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-medium mb-3">
            {s.expertise}
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">{s.bio}</p>
          <button className="w-full py-2 bg-foreground text-background rounded-lg text-sm font-medium transition-colors hover:opacity-90">
            Send Message
          </button>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Speakers;
